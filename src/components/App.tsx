import { Physics, useSphere } from "@react-three/cannon"
import React, { useEffect, useMemo, useState } from "react"
import {
  BufferGeometry,
  ExtrudeGeometry,
  IcosahedronBufferGeometry,
  PlaneBufferGeometry,
  Shape,
} from "three"
import { mergeVertices } from "three-stdlib"
import useInterval from "@use-it/interval"
import { pipe } from "fp-ts/function"

type Vertex = [number, number, number]

const getVertices = (geometry: BufferGeometry, tolerance = 1e-4): Vertex[] =>
  pipe(
    geometry,
    (geometry) => mergeVertices(geometry, tolerance),
    (geometry) =>
      Array.from(geometry.attributes.position.array).reduce(
        (acc: number[][], v: number, i: number) => {
          if (i % 3 === 0) {
            acc.push([v])
          } else {
            acc[acc.length - 1].push(v)
          }
          return acc
        },
        []
      ) as Vertex[]
  )

type Props = {
  formations: Vertex[][]
}

const Particles = ({ formations }: Props) => {
  const radius = 0.1
  const [ref, api] = useSphere((index) => ({
    mass: 1,
    args: radius,
    position: formations[0][index],
  }))

  const [index, setIndex] = useState(0)
  const cycleIndex = () =>
    void setIndex((p) => (p < formations.length - 1 ? p + 1 : 0))

  useInterval(cycleIndex, 5000)

  useEffect(() => {
    let unsubscribers: any[] = []
    for (const [[x1, y1, z1], i] of formations[index].map(
      (v, i) => [v, i] as const
    )) {
      unsubscribers.push(
        api.at(i).position.subscribe(([x0, y0, z0]) => {
          api.at(i).velocity.set(x1 - x0, y1 - y0, z1 - z0)
        })
      )
    }
    return () =>
      void unsubscribers.reduce((_, unsubscribe) => void unsubscribe())
  }, [api, formations, index])

  return (
    <instancedMesh ref={ref} args={[null, null, formations[0].length] as any}>
      <sphereBufferGeometry args={[radius]} />
      <meshBasicMaterial />
    </instancedMesh>
  )
}

const getHeart = () => {
  const shape = new Shape()
  const x = -2.5
  const y = -5
  shape.moveTo(x + 2.5, y + 2.5)
  shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y)
  shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5)
  shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5)
  shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5)
  shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y)
  shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5)

  const geometry = new ExtrudeGeometry(shape, {
    steps: 1,
    depth: 1,
    bevelEnabled: false,
  })
  geometry.scale(1, -1, 1)

  return getVertices(geometry, 1)
}

const App = () => {
  const formations = useMemo(() => {
    const planeVertices = getVertices(new PlaneBufferGeometry(5, 5, 11, 11))
    const icosahedronVertices = getVertices(
      new IcosahedronBufferGeometry(5, 3),
      1.0000000000000001
    ).slice(1, 145)
    const heartVertices = getHeart()
    return [planeVertices, icosahedronVertices, heartVertices]
  }, [])
  return (
    <Physics gravity={[0, 0, 0]}>
      <Particles formations={formations} />
    </Physics>
  )
}

export default App
