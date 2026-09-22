'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

interface ModelViewerProps {
  filePath: string
}

export default function ModelViewer({ filePath }: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf8fafc)

    // Camera
    const width = container.clientWidth || 600
    const height = container.clientHeight || 320
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 10000)
    camera.position.set(0, 0, 200)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(100, 100, 100)
    scene.add(dirLight)

    const dirLight2 = new THREE.DirectionalLight(0x8080ff, 0.3)
    dirLight2.position.set(-100, -100, -100)
    scene.add(dirLight2)

    // Grid
    const gridHelper = new THREE.GridHelper(200, 20, 0xe2e8f0, 0xe2e8f0)
    gridHelper.position.y = -50
    scene.add(gridHelper)

    // Load STL
    const loader = new STLLoader()
    let mesh: THREE.Mesh | null = null

    loader.load(
      filePath,
      (geometry) => {
        geometry.computeBoundingBox()
        geometry.computeVertexNormals()

        const box = geometry.boundingBox!
        const center = new THREE.Vector3()
        box.getCenter(center)
        geometry.translate(-center.x, -center.y, -center.z)

        const size = new THREE.Vector3()
        box.getSize(size)
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 100 / maxDim
        geometry.scale(scale, scale, scale)

        const material = new THREE.MeshPhongMaterial({
          color: 0x6366f1,
          specular: 0x444466,
          shininess: 60,
        })

        mesh = new THREE.Mesh(geometry, material)
        mesh.castShadow = true
        mesh.receiveShadow = true
        scene.add(mesh)

        camera.position.set(0, 50, 180)
        camera.lookAt(0, 0, 0)
      },
      undefined,
      (error) => {
        console.error('STL load error:', error)
      }
    )

    // Mouse interaction for rotation
    let isDragging = false
    let previousMouse = { x: 0, y: 0 }
    const rotation = { x: 0, y: 0 }

    function onMouseDown(e: MouseEvent) {
      isDragging = true
      previousMouse = { x: e.clientX, y: e.clientY }
    }

    function onMouseMove(e: MouseEvent) {
      if (!isDragging || !mesh) return
      const dx = e.clientX - previousMouse.x
      const dy = e.clientY - previousMouse.y
      rotation.y += dx * 0.01
      rotation.x += dy * 0.01
      mesh.rotation.y = rotation.y
      mesh.rotation.x = rotation.x
      previousMouse = { x: e.clientX, y: e.clientY }
    }

    function onMouseUp() {
      isDragging = false
    }

    // Touch support
    function onTouchStart(e: TouchEvent) {
      isDragging = true
      previousMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }

    function onTouchMove(e: TouchEvent) {
      if (!isDragging || !mesh) return
      const dx = e.touches[0].clientX - previousMouse.x
      const dy = e.touches[0].clientY - previousMouse.y
      rotation.y += dx * 0.01
      rotation.x += dy * 0.01
      mesh.rotation.y = rotation.y
      mesh.rotation.x = rotation.x
      previousMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }

    renderer.domElement.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onMouseUp)

    // Auto-rotate when not dragging
    let animId: number
    function animate() {
      animId = requestAnimationFrame(animate)
      if (!isDragging && mesh) {
        mesh.rotation.y += 0.005
        rotation.y += 0.005
      }
      renderer.render(scene, camera)
    }
    animate()

    // Resize
    function handleResize() {
      const w = container?.clientWidth || 600
      const h = container?.clientHeight || 320
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      renderer.domElement.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      renderer.domElement.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onMouseUp)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [filePath])

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="w-full h-80 cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      />
      <div className="absolute bottom-3 left-3 text-xs text-slate-400 bg-white/80 px-2 py-1 rounded-full">
        Glissez pour faire tourner
      </div>
    </div>
  )
}
