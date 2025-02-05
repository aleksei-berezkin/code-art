import { rect2dSize, rect2dVerticesNum, setRect2d } from './rect'
import type { SceneBounds } from '../model/SceneBounds'
import type { WorkLimiter } from '../util/workLimiter'

const maxSideCount = 1000
const rectsInArray = 3000

export type EffectsVertices = {
    vertices: Float32Array,
    verticesNum: number,
}

// Because w is non-linear of (x, y) we can't draw just one rect of (xMin, yMin)-(xMax, yMax).
export async function* createEffectsGrid(
    sceneBounds: SceneBounds,
    realTextBounds: SceneBounds,
    fontSize: number,
    workLimiter: WorkLimiter,
): AsyncGenerator<EffectsVertices> {
    const vertices = new Float32Array(rectsInArray * rect2dSize)
    let rectsCount = 0
    function* pushRect(x1: number, y1: number, x2: number, y2: number) {
        setRect2d(vertices, rectsCount * rect2dSize, x1, y1, x2, y2)
        if (++rectsCount === rectsInArray) {
            yield* flushRects()
        }
    }
    function* flushRects() {
        if (rectsCount) {
            yield {
                vertices,
                verticesNum: rectsCount * rect2dVerticesNum,
            }
            rectsCount = 0
        }
    }

    for (const r of createOutsideTextRects(sceneBounds, realTextBounds)) {
        await workLimiter.next()
        yield* pushRect(...r)
    }

    const xCount = Math.min(maxSideCount, (realTextBounds.xMax - realTextBounds.xMin) / fontSize)
    const yCount = Math.min(maxSideCount, (realTextBounds.yMax - realTextBounds.yMin) / fontSize)
    for (const r of createRectsLinear(xCount, yCount, realTextBounds.xMin, realTextBounds.yMin, realTextBounds.xMax, realTextBounds.yMax)) {
        await workLimiter.next()
        yield* pushRect(...r)
    }

    yield* flushRects()
}

function* createRectsLinear(xCount: number, yCount: number, x1: number, y1: number, x2: number, y2: number) {
    const wStep = (x2 - x1) / xCount
    const hStep = (y2 - y1) / yCount
    for (let i = 0; i < xCount; i++)
        for (let j = 0; j < yCount; j++)
            yield [x1 + i * wStep, y1 + j * hStep, x1 + (i + 1) * wStep, y1 + (j + 1) * hStep] as const
}

function* createOutsideTextRects(o: SceneBounds, i: SceneBounds) {
    const top = o.yMin < i.yMin
    const bottom = o.yMax > i.yMax
    const left = o.xMin < i.xMin
    const right = o.xMax > i.xMax

    if (top) {
        if (left) {
            yield* createOutsideRects(o.xMin, o.yMin, i.xMin, i.yMin)
        }
        yield* createOutsideRects(i.xMin, o.yMin, i.xMax, i.yMin)
        if (right) {
            yield* createOutsideRects(i.xMax, o.yMin, o.xMax, i.yMin)
        }
    }
    if (left) {
        yield* createOutsideRects(o.xMin, i.yMin, i.xMin, i.yMax)
    }
    if (right) {
        yield* createOutsideRects(i.xMax, i.yMin, o.xMax, i.yMax)
    }
    if (bottom) {
        if (left) {
            yield* createOutsideRects(o.xMin, i.yMax, i.xMin, o.yMax)
        }
        yield* createOutsideRects(i.xMin, i.yMax, i.xMax, o.yMax)
        if (right) {
            yield* createOutsideRects(i.xMax, i.yMax, o.xMax, o.yMax)
        }
    }
}


function* createOutsideRects(x1: number, y1: number, x2: number, y2: number): IterableIterator<[number, number, number, number]> {
    const nMax = 12
    const linearSize = 1000
    const geometricBase = 1000
    const multiplier = 2.5

    function* generateRanges(t1: number, t2: number): IterableIterator<[number, number]> {
        const [from, to] = Math.abs(t1) < Math.abs(t2) ? [t1, t2] : [t2, t1]
        const span = Math.abs(to - from)
        const sign = Math.sign(to - from)
        if (span <= linearSize * nMax) {
            const actualLinearItems = Math.ceil(span / linearSize)
            const actualLinearSize = span / actualLinearItems
            for (let i = 0; i < actualLinearItems; i++)
                yield [from + sign * i * actualLinearSize, from + sign * (i + 1) * actualLinearSize]
            return
        }

        let near = 0
        let far = geometricBase
        for (let i = 0; i < nMax; i++) {
            yield [from + sign * near, from + sign * far]
            if (far >= span) break
            near = far
            far = Math.min(span, far * multiplier)
        }
    }

    for (const [_x1, _x2] of generateRanges(x1, x2))
        for (const [_y1, _y2] of generateRanges(y1, y2))
            yield[_x1, _y1, _x2, _y2]
}
