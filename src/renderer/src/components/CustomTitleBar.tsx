import { useState, useEffect } from 'react'
import './CustomTitleBar.css'

interface CustomTitleBarProps {
  title?: string
}

function CustomTitleBar({ title = '用户信息表单' }: CustomTitleBarProps): React.JSX.Element {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    const checkMaximized = async () => {
      try {
        const maximized = await window.api.windowIsMaximized()
        setIsMaximized(maximized)
      } catch (error) {
        console.error('检查窗口状态失败:', error)
      }
    }

    checkMaximized()
  }, [])

  const handleMinimize = async () => {
    try {
      await window.api.windowMinimize()
    } catch (error) {
      console.error('最小化窗口失败:', error)
    }
  }

  const handleMaximize = async () => {
    try {
      await window.api.windowMaximize()
      setIsMaximized(!isMaximized)
    } catch (error) {
      console.error('最大化窗口失败:', error)
    }
  }

  const handleClose = async () => {
    try {
      await window.api.windowClose()
    } catch (error) {
      console.error('关闭窗口失败:', error)
    }
  }

  const handleReload = async () => {
    try {
      await window.api.windowReload()
    } catch (error) {
      console.error('刷新失败:', error)
    }
  }

  return (
    <div className="custom-titlebar">
      <div className="titlebar-drag-region">
        <div className="titlebar-icon !hidden">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
        </div>
        <div className="titlebar-title !hidden">{title}</div>
      </div>
      <div className="titlebar-controls">
        <button 
          className="titlebar-button reload-button"
          onClick={handleReload}
          title="刷新"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-6.22-8.56" />
            <path d="M21 3v5h-5" />
          </svg>
        </button>
        <button 
          className="titlebar-button minimize-button"
          onClick={handleMinimize}
          title="最小化"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M0,5 L10,5" stroke="currentColor" strokeWidth="1" fill="none"/>
          </svg>
        </button>
        <button 
          className="titlebar-button maximize-button"
          onClick={handleMaximize}
          title={isMaximized ? "还原" : "最大化"}
        >
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M2,2 L8,2 L8,8 L2,8 Z" stroke="currentColor" strokeWidth="1" fill="none"/>
              <path d="M3,3 L7,3 L7,7 L3,7 Z" stroke="currentColor" strokeWidth="1" fill="none"/>
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M0,0 L10,0 L10,10 L0,10 Z" stroke="currentColor" strokeWidth="1" fill="none"/>
            </svg>
          )}
        </button>
        <button 
          className="titlebar-button close-button"
          onClick={handleClose}
          title="关闭"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M0,0 L10,10 M10,0 L0,10" stroke="currentColor" strokeWidth="1" fill="none"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default CustomTitleBar
