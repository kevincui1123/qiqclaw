import React, { useState, useEffect, useRef, ReactNode } from 'react'
import './CustomScrollbar.css'

interface CustomScrollbarProps {
  children: ReactNode
  className?: string
  scrollContentClassName?: string
  onScroll?: (scrollTop: number) => void
}

const CustomScrollbar: React.FC<CustomScrollbarProps> = ({
  children,
  className = '',
  scrollContentClassName = '',
  onScroll
}) => {
  const scrollContentRef = useRef<HTMLDivElement>(null)
  const scrollTrackRef = useRef<HTMLDivElement>(null)
  const scrollThumbRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragStartScrollTop, setDragStartScrollTop] = useState(0)
  const [justFinishedDragging, setJustFinishedDragging] = useState(false)

  const updateScrollbar = () => {
    const scrollContent = scrollContentRef.current
    const scrollThumb = scrollThumbRef.current
    const scrollTrack = scrollTrackRef.current

    if (!scrollContent || !scrollThumb || !scrollTrack) return

    const { scrollTop, scrollHeight, clientHeight } = scrollContent
    const trackHeight = scrollTrack.clientHeight

    const thumbHeight = Math.max(20, (clientHeight / scrollHeight) * trackHeight)
    scrollThumb.style.height = `${thumbHeight}px`


    const maxScrollTop = scrollHeight - clientHeight
    const thumbTop = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * (trackHeight - thumbHeight) : 0
    scrollThumb.style.top = `${thumbTop}px`


    const shouldShow = scrollHeight > clientHeight
    scrollTrack.style.opacity = shouldShow ? '1' : '0'


    if (onScroll) {
      onScroll(scrollTop)
    }
  }


  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStartY(e.clientY)
    setDragStartScrollTop(scrollContentRef.current?.scrollTop || 0)
  }


  const handleThumbMouseMove = (e: MouseEvent) => {
    if (!isDragging || !scrollContentRef.current || !scrollTrackRef.current) return

    const scrollContent = scrollContentRef.current
    const scrollTrack = scrollTrackRef.current
    const deltaY = e.clientY - dragStartY
    const trackHeight = scrollTrack.clientHeight
    const thumbHeight = scrollThumbRef.current?.clientHeight || 20
    const maxScrollTop = scrollContent.scrollHeight - scrollContent.clientHeight

    const scrollDelta = (deltaY / (trackHeight - thumbHeight)) * maxScrollTop
    const newScrollTop = Math.max(0, Math.min(maxScrollTop, dragStartScrollTop + scrollDelta))
    
    scrollContent.scrollTop = newScrollTop
  }


  const handleThumbMouseUp = () => {
    setIsDragging(false)
    setJustFinishedDragging(true)
    setTimeout(() => {
      setJustFinishedDragging(false)
    }, 0)
  }


  const handleTrackClick = (e: React.MouseEvent) => {
    if (justFinishedDragging) {
      e.preventDefault()
      e.stopPropagation()
      return
    }

    if (!scrollContentRef.current || !scrollTrackRef.current || !scrollThumbRef.current) return

    const scrollContent = scrollContentRef.current
    const scrollTrack = scrollTrackRef.current
    const scrollThumb = scrollThumbRef.current
    const rect = scrollTrack.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    const trackHeight = scrollTrack.clientHeight
    const thumbHeight = scrollThumb.clientHeight
    const maxScrollTop = scrollContent.scrollHeight - scrollContent.clientHeight

    const newScrollTop = (clickY / (trackHeight - thumbHeight)) * maxScrollTop
    scrollContent.scrollTop = Math.max(0, Math.min(maxScrollTop, newScrollTop))
  }


  useEffect(() => {
    const scrollContent = scrollContentRef.current
    if (!scrollContent) return

    scrollContent.addEventListener('scroll', updateScrollbar)
    
    const handleResize = () => updateScrollbar()
    window.addEventListener('resize', handleResize)

    updateScrollbar()

    return () => {
      scrollContent.removeEventListener('scroll', updateScrollbar)
      window.removeEventListener('resize', handleResize)
    }
  }, [])


  useEffect(() => {
    if (!isDragging) return

    const handleGlobalMouseMove = (e: MouseEvent) => handleThumbMouseMove(e)
    const handleGlobalMouseUp = () => handleThumbMouseUp()

    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, dragStartY, dragStartScrollTop])

  return (
    <div className={`custom-scrollbar-container ${className}`}>
      <div 
        ref={scrollContentRef}
        className={`scroll-content ${scrollContentClassName}`}
      >
        {children}
      </div>
      
      {/* 自定义滚动条 */}
      <div 
        ref={scrollTrackRef}
        className="custom-scrollbar-track"
        onClick={handleTrackClick}
      >
        <div 
          ref={scrollThumbRef}
          className="custom-scrollbar-thumb"
          onMouseDown={handleThumbMouseDown}
        />
      </div>
    </div>
  )
}

export default CustomScrollbar
