import { useState, useRef, useEffect } from 'react'
import './Video.css'
import wechatImg from '../assets/wechat.jpg'

function Video(): React.JSX.Element {
  const [inputVideoUrl, setInputVideoUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [_videoFilePath, setVideoFilePath] = useState('')
  const [isUploadMode, setIsUploadMode] = useState(false) 
  const [_selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
  const [originalScript, setOriginalScript] = useState('')
  const [rewrittenScript, setRewrittenScript] = useState('')
  const [llmModel, setLlmModel] = useState('')
  const [llmModels, setLlmModels] = useState<Array<{ id: number; name: string; value: string; orderNum: number }>>([])
  const [_language, setLanguage] = useState('zh-CN')
  
  const [sourceLanguage, setSourceLanguage] = useState('zh-CN')
  const [translatedText, setTranslatedText] = useState('')
  const [showTranslatedInTextarea, _setShowTranslatedInTextarea] = useState(false) 
  const [downloadProgress, _setDownloadProgress] = useState(0)
  const [isDownloading, _setIsDownloading] = useState(false)
  const downloadIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [extractProgress, _setExtractProgress] = useState(0)
  const [isExtracting, _setIsExtracting] = useState(false)
  const extractIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [rewriteProgress, _setRewriteProgress] = useState(0)
  const [isRewriting, _setIsRewriting] = useState(false)
  const rewriteIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [textToAudioProgress, _setTextToAudioProgress] = useState(0)
  const [isTextToAudioing, _setIsTextToAudioing] = useState(false)
  const textToAudioIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [generateVideoProgress, _setGenerateVideoProgress] = useState(0)
  const [isGeneratingVideo, _setIsGeneratingVideo] = useState(false)
  const generateVideoIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [mainTitle, setMainTitle] = useState('')
  const [subTitle, setSubTitle] = useState('')
  const [viralTitle, setViralTitle] = useState('')
  const [videoTags, setVideoTags] = useState('')
  const [titleGenerateProgress, _setTitleGenerateProgress] = useState(0)
  const [isGeneratingTitle, _setIsGeneratingTitle] = useState(false)
  const titleGenerateIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [referenceAudio, setReferenceAudio] = useState('')
  const [_referenceAudioPromptText, _setReferenceAudioPromptText] = useState('') 
  const [audioSpeed, setAudioSpeed] = useState(1.0) 
  const [audioDelaySeconds, setAudioDelaySeconds] = useState(1) 
  const [isAudioPlaying, _setIsAudioPlaying] = useState(false)

  const [videoMaterial, setVideoMaterial] = useState('')
  const [inferenceBatch, setInferenceBatch] = useState(20)
  const [inferenceFactor, setInferenceFactor] = useState(1.5)
  const [generatedVideoPreview, _setGeneratedVideoPreview] = useState('')

  const [showImgModal, setShowImgModal] = useState(false)
  const [imgModalSrc, setImgModalSrc] = useState('')
  const previewVideoRef = useRef<HTMLVideoElement | null>(null)
  const downloadVideoRef = useRef<HTMLVideoElement | null>(null)

  const [subtitleFont, setSubtitleFont] = useState('黑体')
  const [subtitleFontWeight, setSubtitleFontWeight] = useState(400)
  const [subtitleSize, setSubtitleSize] = useState(36)
  const [subtitleColor, setSubtitleColor] = useState('#DE0202')
  const [subtitleStrokeColor, setSubtitleStrokeColor] = useState('#ECB1B1')
  const [subtitleBottomMargin, setSubtitleBottomMargin] = useState(180)
  const [subtitleText, setSubtitleText] = useState('')
  const [_isGeneratingSubtitle, _setIsGeneratingSubtitle] = useState(false)
  const [_subtitleProgress, _setSubtitleProgress] = useState(0)
  const [_originalVideoPath, setOriginalVideoPath] = useState('')
  
  const [activeProcessingType, _setActiveProcessingType] = useState<'title' | 'subtitle' | 'bgm' | null>(null)
  const [processingProgress, _setProcessingProgress] = useState(0)

  const [bgmVolume, setBgmVolume] = useState(0.5)
  const [selectedBgm, setSelectedBgm] = useState('') 
  const [_isAddingBgm, _setIsAddingBgm] = useState(false) 
  const [_bgmProgress, _setBgmProgress] = useState(0) 
  const [publishPlatform, setPublishPlatform] = useState('douyin')
  const [isPublishing, _setIsPublishing] = useState(false)

  const [_isAddingTitle, _setIsAddingTitle] = useState(false)
  const [_titleProgress, _setTitleProgress] = useState(0)

  const [_dataRefreshKey, setDataRefreshKey] = useState(0)
  useEffect(() => {
    const handler = () => setDataRefreshKey((k) => k + 1)
    window.addEventListener('data-management-updated', handler)
    return () => window.removeEventListener('data-management-updated', handler)
  }, [])

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLlmModels([
          {id: 1, name: 'DeepSeek', value: 'DeepSeek', orderNum: 1},
          {id: 2, name: '千问', value: 'Qwen', orderNum: 2},
          {id: 3, name: '豆包', value: '豆包', orderNum: 3},
        ])
        setLlmModel('DeepSeek')
      } catch (error) {
        console.error('Failed to load models:', error)
      }
    }
    loadModels()
  }, [])


  useEffect(() => {
    return () => {
      if (downloadIntervalRef.current) {
        clearInterval(downloadIntervalRef.current)
      }
      if (extractIntervalRef.current) {
        clearInterval(extractIntervalRef.current)
      }
      if (rewriteIntervalRef.current) {
        clearInterval(rewriteIntervalRef.current)
      }
      if (titleGenerateIntervalRef.current) {
        clearInterval(titleGenerateIntervalRef.current)
      }
      if (textToAudioIntervalRef.current) {
        clearInterval(textToAudioIntervalRef.current)
      }
      if (generateVideoIntervalRef.current) {
        clearInterval(generateVideoIntervalRef.current)
      }
    }
  }, [])

  const handleOpenImgModal = () => {
    setImgModalSrc(wechatImg)
    setShowImgModal(true)
  }

  const handleCloseImgModal = () => {
    setShowImgModal(false)
    setImgModalSrc('')
  }

  const handleDownloadVideo = async () => {
    handleOpenImgModal()
  }

  const handleVideoFileSelect = async () => {
    handleOpenImgModal()
  }

  const handleExtractScript = async () => {
    handleOpenImgModal()
  }

  const handleRewriteScript = async () => {
    handleOpenImgModal()
  }


  const handleOpenTranslateModal = () => {
    handleOpenImgModal()
  }


  const handleUploadAudio = async () => {
    handleOpenImgModal()
  }


  const handleUploadVideoMaterial = async () => {
    handleOpenImgModal()
  }

  const handleUploadBgmMaterial = async () => {
    handleOpenImgModal()
  }


  const handleTextToAudio = async () => {
    handleOpenImgModal()
  }


  const handleGenerateVideo = async () => {
    handleOpenImgModal()
  }

  const handleGenerateSubtitle = async () => {
    handleOpenImgModal()
  }

  const handleOpenPhoneModal = () => {
    handleOpenImgModal()
  }

  const handleOpenTitleStyleModal = () => {
    handleOpenImgModal()
  }

  const handleAddBgm = async () => {
    handleOpenImgModal()
  }

  const handlePublish = async () => {
    handleOpenImgModal()
  }

  const handleGenerateTitle = async () => {
    handleOpenImgModal()
  }

  return (
    <div className="video-page">
      <div className="video-page-container">
        {/* 第一列：文案生成 */}
        <div className="video-column">
          <div className="video-card">
            <div className="video-card-header">
              <span className="video-card-number">01</span>
              <span className="video-card-title">文案生成</span>
            </div>
            
            <div className="video-card-body">
              <div className="video-form-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label className="video-label" style={{ flex: 1 }}>
                    {isUploadMode ? '选择本地视频' : '视频URL'}
                  </label>
                  <button
                    onClick={() => {
                      setIsUploadMode(!isUploadMode)
                      setInputVideoUrl('')
                      setSelectedVideoFile(null)
                      setVideoUrl('')
                      setVideoFilePath('')
                      setOriginalVideoPath('')
                    }}
                    title={isUploadMode ? '切换到下载模式' : '切换到上传模式'}
                    style={{
                      padding: '1.5px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s',
                      width: '17.59px',
                      height: '17.59px',
                      minWidth: '17.59px',
                      minHeight: '17.59px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    {isUploadMode ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    )}
                  </button>
                </div>
                {isUploadMode ? (
                  <input
                    type="file"
                    accept="video/mp4,.mp4"
                    onChange={handleVideoFileSelect}
                    className="video-file-input"
                    disabled={isDownloading}
                  />
                ) : (
                  <input
                    type="text"
                    value={inputVideoUrl}
                    onChange={(e) => setInputVideoUrl(e.target.value)}
                    placeholder="输入视频URL"
                    className="video-input"
                    disabled={isDownloading}
                  />
                )}
              </div>

              <div className="video-form-group">
                {isUploadMode ? (
                  <div>
                  </div>
                ) : (
                  <button 
                    onClick={handleDownloadVideo}
                    disabled={isDownloading}
                    className="video-button video-button-primary"
                  >
                    {isDownloading ? `下载中 ${downloadProgress}%` : '下载视频'}
                  </button>
                )}
                {isDownloading && (
                  <div className="video-progress">
                    <div 
                      className="video-progress-bar" 
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="video-form-group">
                <label className="video-label">视频预览</label>
                <div className="video-preview-box video-preview-box-with-play">
                  {videoUrl ? (
                    <>
                      <video 
                        ref={downloadVideoRef}
                        className="video-preview-media" 
                        preload="metadata"
                        onClick={() => {
                          handleOpenPhoneModal()
                        }}
                      >
                        <source src={videoUrl} />
                      </video>
                      <button 
                        className="video-play-button"
                        onClick={() => {
                          handleOpenPhoneModal()
                        }}
                      >
                        <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                          <path d="M6 4L16 10L6 16V4Z" fill="currentColor"/>
                        </svg>
                      </button>
                    </>
                  ) : (
                    <div className="video-preview-placeholder">暂无视频</div>
                  )}
                </div>
              </div>

              <div className="video-form-group">
                <button 
                  onClick={handleExtractScript}
                  disabled={isExtracting}
                  className="video-button video-button-primary"
                >
                  {isExtracting ? `提取中 ${extractProgress}%` : '提取视频文案'}
                </button>
                {isExtracting && (
                  <div className="video-progress">
                    <div 
                      className="video-progress-bar" 
                      style={{ width: `${extractProgress}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="video-form-group">
                <label className="video-label">文案内容</label>
                <textarea
                  value={originalScript}
                  onChange={(e) => setOriginalScript(e.target.value)}
                  placeholder="提取的文案将显示在这里..."
                  rows={5}
                  className="video-textarea"
                />
              </div>

              <div className="video-form-row">
                <div className="video-form-group">
                  <label className="video-label">语言</label>
                  <select
                    value={sourceLanguage}
                    onChange={(e) => {
                      setSourceLanguage(e.target.value)
                      setLanguage(e.target.value)
                    }}
                    className="video-select"
                  >
                    <option value="zh-CN">中文</option>
                    <option value="en-US">英语</option>
                  </select>
                </div>
                <div className="video-form-group">
                  <label className="video-label">LLM模型</label>
                  <select
                    value={llmModel}
                    onChange={(e) => setLlmModel(e.target.value)}
                    className="video-select"
                  >
                    {llmModels.length > 0 ? (
                      llmModels.map((model) => (
                        <option key={model.id} value={model.value}>
                          {model.name}
                        </option>
                      ))
                    ) : (
                      <option value="">加载中...</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="video-form-group">
                <button 
                  onClick={handleRewriteScript}
                  disabled={isRewriting}
                  className="video-button video-button-primary"
                >
                  {isRewriting ? `仿写中 ${rewriteProgress}%` : '执行仿写'}
                </button>
                {isRewriting && (
                  <div className="video-progress">
                    <div 
                      className="video-progress-bar" 
                      style={{ width: `${rewriteProgress}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="video-form-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label className="video-label" style={{ flex: 1 }}>
                    新文案
                  </label>
                </div>
                <textarea
                  value={showTranslatedInTextarea && translatedText ? translatedText : rewrittenScript}
                  onChange={(e) => {
                    if (showTranslatedInTextarea && translatedText) {
                      setTranslatedText(e.target.value)
                    } else {
                      setRewrittenScript(e.target.value)
                    }
                  }}
                  placeholder="仿写后的文案将显示在这里..."
                  rows={5}
                  className="video-textarea"
                />
              </div>

              <div className="video-form-group">
                <button 
                  onClick={handleOpenTranslateModal}
                  className="video-button video-button-primary"
                >
                  翻译文案
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 第二列：标题与标签 + 音频生成 */}
        <div className="video-column">
          {/* 标题与标签 */}
          <div className="video-card">
            <div className="video-card-header">
              <span className="video-card-number">02</span>
              <span className="video-card-title">标题与标签</span>
            </div>
            
            <div className="video-card-body">
              <div className="video-form-group">
                <button 
                  onClick={handleGenerateTitle}
                  disabled={isGeneratingTitle}
                  className="video-button video-button-primary"
                >
                  {isGeneratingTitle ? `生成中 ${Math.round(titleGenerateProgress)}%` : '标题与话题标签生成'}
                </button>
                {isGeneratingTitle && (
                  <div className="video-progress">
                    <div 
                      className="video-progress-bar" 
                      style={{ width: `${titleGenerateProgress}%` }}
                    />
                  </div>
                )}
              </div>
              
              <div className="video-form-group">
                <label className="video-label">封面主标题</label>
                <input
                  type="text"
                  value={mainTitle}
                  onChange={(e) => setMainTitle(e.target.value)}
                  placeholder="输入主标题"
                  className="video-input"
                />
              </div>

              <div className="video-form-group">
                <label className="video-label">副标题</label>
                <input
                  type="text"
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  placeholder="输入副标题"
                  className="video-input"
                />
              </div>

              <div className="video-form-group">
                <label className="video-label">爆款视频标题</label>
                <input
                  type="text"
                  value={viralTitle}
                  onChange={(e) => setViralTitle(e.target.value)}
                  placeholder="输入爆款标题"
                  className="video-input"
                />
              </div>

              <div className="video-form-group">
                <label className="video-label">视频标签</label>
                <input
                  type="text"
                  value={videoTags}
                  onChange={(e) => setVideoTags(e.target.value)}
                  placeholder="输入标签，用逗号分隔"
                  className="video-input"
                />
              </div>
            </div>
          </div>

          {/* 音频生成 */}
          <div className="video-card">
            <div className="video-card-header">
              <span className="video-card-number">03</span>
              <span className="video-card-title">音频生成</span>
            </div>
            
            <div className="video-card-body">
              <div className="video-form-group">
                <label className="video-label">参考音频（音色）</label>
                <select
                  value={referenceAudio}
                  onChange={(e) => setReferenceAudio(e.target.value)}
                  className="video-select"
                >
                  <option value="">请选择音色</option>
                </select>
              </div>

              <div className="video-form-group">
                <label className="video-label">调节语速: {audioSpeed}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={audioSpeed}
                  onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
                  className="video-range"
                />
              </div>

              <div className="video-form-group">
                <label className="video-label">延迟播音: {audioDelaySeconds}秒</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={audioDelaySeconds}
                  onChange={(e) => setAudioDelaySeconds(parseFloat(e.target.value))}
                  className="video-range"
                />
              </div>

              <div className="video-form-group">
                <label className="video-label">上传音频</label>
                <input
                  type="file"
                  accept="audio/wav,audio/mpeg,audio/mp3,audio/mp4,.wav,.mp3,.m4a"
                  className="video-file-input"
                  onChange={handleUploadAudio}
                />
              </div>

              <div className="video-form-group">
                <button 
                  onClick={handleTextToAudio}
                  disabled={isTextToAudioing}
                  className="video-button video-button-primary"
                >
                  {isTextToAudioing ? `转换中 ${textToAudioProgress}%` : '文案转音频'}
                </button>
                {isTextToAudioing && (
                  <div className="video-progress">
                    <div 
                      className="video-progress-bar" 
                      style={{ width: `${textToAudioProgress}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="video-form-group">
                <label className="video-label">音频预览</label>
                <div className={`audio-waveform ${isAudioPlaying ? 'playing' : ''}`}>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                  <div className="waveform-bar"></div>
                </div>
                <div className="video-preview-box video-preview-box-audio">
                  <div className="video-preview-placeholder">暂无音频</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 第三列：视频生成 */}
        <div className="video-column">
          <div className="video-card">
            <div className="video-card-header">
              <span className="video-card-number">04</span>
              <span className="video-card-title">视频生成</span>
            </div>
            
            <div className="video-card-body">
              <div className="video-form-group">
                <label className="video-label">选择视频素材</label>
                <select
                  value={videoMaterial}
                  onChange={(e) => setVideoMaterial(e.target.value)}
                  className="video-select"
                >
                  <option value="">请选择素材</option>
                </select>
              </div>

              <div className="video-form-row">
                <div className="video-form-group">
                  <label className="video-label">推理批次</label>
                  <input
                    type="number"
                    min="10"
                    max="50"
                    value={inferenceBatch}
                    onChange={(e) => setInferenceBatch(parseInt(e.target.value))}
                    className="video-input"
                  />
                </div>
                <div className="video-form-group">
                  <label className="video-label">推理因子</label>
                  <input
                    type="number"
                    min="1"
                    max="3"
                    step="0.1"
                    value={inferenceFactor}
                    onChange={(e) => setInferenceFactor(parseFloat(e.target.value))}
                    className="video-input"
                  />
                </div>
              </div>

              <div className="video-form-group">
                <label className="video-label">上传视频素材</label>
                <input
                  type="file"
                  accept="video/mp4,.mp4"
                  className="video-file-input"
                  onChange={handleUploadVideoMaterial}
                />
              </div>

              <div className="video-form-group">
                <button 
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo}
                  className="video-button video-button-primary"
                >
                  {isGeneratingVideo ? `生成中 ${generateVideoProgress}%` : '生成视频'}
                </button>
                {isGeneratingVideo && (
                  <div className="video-progress">
                    <div 
                      className="video-progress-bar" 
                      style={{ width: `${generateVideoProgress}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="video-form-group">
                <label className="video-label">视频预览</label>
                <div className="video-preview-box video-preview-box-generated video-preview-box-with-play">
                  {generatedVideoPreview ? (
                    <>
                      <video 
                        ref={previewVideoRef}
                        className="video-preview-media" 
                        preload="metadata"
                        onClick={() => {
                          handleOpenPhoneModal()
                        }}
                      >
                        <source src={generatedVideoPreview} type="video/mp4" />
                      </video>
                      <button 
                        className="video-play-button"
                        onClick={() => {
                          handleOpenPhoneModal()
                        }}
                      >
                        <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                          <path d="M6 4L16 10L6 16V4Z" fill="currentColor"/>
                        </svg>
                      </button>
                    </>
                  ) : (
                    <div className="video-preview-placeholder">生成后的视频将显示在这里</div>
                  )}
                </div>
              </div>

              <div className="video-form-group">
                <button
                  onClick={() => handleOpenTitleStyleModal()}
                  className="video-button video-button-primary"
                >
                  插入标题
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 第四列：添加字幕 + 添加BGM */}
        <div className="video-column">
          {/* 添加字幕 */}
          <div className="video-card">
            <div className="video-card-header">
              <span className="video-card-number">05</span>
              <span className="video-card-title">添加字幕</span>
            </div>
            
            <div className="video-card-body">
              <div className="video-form-group">
                <label className="video-label">字体与字号</label>
                <div className="video-font-row">
                  <select
                    value={subtitleFont}
                    onChange={(e) => setSubtitleFont(e.target.value)}
                    className="video-select"
                    style={{ fontWeight: 'inherit' }}
                  >
                    <option value="SimHei">黑体</option>
                  </select>
                  <select
                    value={subtitleSize}
                    onChange={(e) => setSubtitleSize(parseInt(e.target.value))}
                    className="video-select video-select-weight"
                    style={{ fontWeight: 'inherit' }}
                  >
                    <option value="16">16px</option>
                    <option value="20">20px</option>
                    <option value="24">24px</option>
                    <option value="28">30px</option>
                    <option value="36">36px</option>
                    <option value="40">42px</option>
                    <option value="48">48px</option>
                    <option value="48">56px</option>
                    <option value="48">64px</option>
                    <option value="48">72px</option>
                    <option value="48">84px</option>
                    <option value="48">96px</option>
                  </select>
                </div>
              </div>

              <div className="video-form-group">
                <label className="video-label">字体设置</label>
                <div className="video-color-group">
                  <div className="video-color-item">
                    <label className="video-color-label">字体粗细</label>
                    <select
                      value={subtitleFontWeight}
                      onChange={(e) => setSubtitleFontWeight(Number(e.target.value))}
                      className="video-select video-select-small"
                    >
                      {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                  <div className="video-color-item">
                    <label className="video-color-label">字体颜色</label>
                    <div className="video-color-input-group">
                      <input
                        type="color"
                        value={subtitleColor}
                        onChange={(e) => setSubtitleColor(e.target.value)}
                        className="video-color-picker"
                      />
                      <input
                        type="text"
                        value={subtitleColor}
                        onChange={(e) => setSubtitleColor(e.target.value)}
                        className="video-color-text"
                      />
                    </div>
                  </div>
                  <div className="video-color-item">
                    <label className="video-color-label">描边颜色</label>
                    <div className="video-color-input-group">
                      <input
                        type="color"
                        value={subtitleStrokeColor}
                        onChange={(e) => setSubtitleStrokeColor(e.target.value)}
                        className="video-color-picker"
                      />
                      <input
                        type="text"
                        value={subtitleStrokeColor}
                        onChange={(e) => setSubtitleStrokeColor(e.target.value)}
                        className="video-color-text"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="video-form-group">
                <label className="video-label">底部边距: {subtitleBottomMargin}px</label>
                <input
                  type="range"
                  min="0"
                  max="400"
                  value={subtitleBottomMargin}
                  onChange={(e) => setSubtitleBottomMargin(parseInt(e.target.value))}
                  className="video-range"
                />
              </div>

              <div className="video-form-group">
                <label className="video-label">字幕调整</label>
                <textarea
                  value={subtitleText}
                  onChange={(e) => setSubtitleText(e.target.value)}
                  placeholder="手动调整字幕内容..."
                  rows={7}
                  className="video-textarea"
                />
              </div>

              <div className="video-form-group">
                <button
                  onClick={handleGenerateSubtitle}
                  className="video-button video-button-primary"
                >
                  {activeProcessingType === 'subtitle' ? `插入中 ${processingProgress}%` : '插入字幕'}
                </button>
                {activeProcessingType === 'subtitle' && (
                  <div className="video-progress">
                    <div
                      className="video-progress-bar"
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 添加BGM */}
          <div className="video-card">
            <div className="video-card-header">
              <span className="video-card-number">06</span>
              <span className="video-card-title">添加BGM</span>
            </div>
            
            <div className="video-card-body">
              <div className="video-form-group">
                <label className="video-label">调整背景音量: {Math.round(bgmVolume * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={bgmVolume}
                  onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                  className="video-range"
                />
              </div>

              <div className="video-form-group">
                <label className="video-label">选择背景音乐</label>
                <select
                  value={selectedBgm}
                  onChange={(e) => setSelectedBgm(e.target.value)}
                  className="video-select"
                >
                  <option value="">请选择音乐</option>
                </select>
              </div>

              <div className="video-form-group">
                <label className="video-label">上传背景音乐文件</label>
                <input
                  type="file"
                  accept="audio/wav,audio/mpeg,audio/mp3,audio/mp4,.wav,.mp3,.m4a"
                  className="video-file-input"
                  onChange={handleUploadBgmMaterial}
                />
              </div>

              <div className="video-form-group">
                <button
                  onClick={handleAddBgm}
                  className="video-button video-button-primary"
                >
                  {activeProcessingType === 'bgm' ? `插入中 ${processingProgress}%` : '插入BGM'}
                </button>
                {activeProcessingType === 'bgm' && (
                  <div className="video-progress">
                    <div
                      className="video-progress-bar"
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="video-form-group">
                <label className="video-label">发布平台</label>
                <div className="video-radio-group">
                  <label className="video-radio-label">
                    <input
                      type="radio"
                      name="publishPlatform"
                      value="douyin"
                      checked={publishPlatform === 'douyin'}
                      onChange={(e) => setPublishPlatform(e.target.value)}
                      className="video-radio"
                    />
                    <span>抖音</span>
                  </label>
                  <label className="video-radio-label">
                    <input
                      type="radio"
                      name="publishPlatform"
                      value="kuaishou"
                      checked={publishPlatform === 'kuaishou'}
                      onChange={(e) => setPublishPlatform(e.target.value)}
                      className="video-radio"
                    />
                    <span>快手</span>
                  </label>
                  <label className="video-radio-label">
                    <input
                      type="radio"
                      name="publishPlatform"
                      value="bilibili"
                      checked={publishPlatform === 'bilibili'}
                      onChange={(e) => setPublishPlatform(e.target.value)}
                      className="video-radio"
                    />
                    <span>视频号</span>
                  </label>
                  <label className="video-radio-label">
                    <input
                      type="radio"
                      name="publishPlatform"
                      value="bilibili"
                      checked={publishPlatform === 'bilibili'}
                      onChange={(e) => setPublishPlatform(e.target.value)}
                      className="video-radio"
                    />
                    <span>小红书</span>
                  </label>
                </div>
              </div>

              <div className="video-form-group">
                <button
                  className="video-button video-button-publish"
                  onClick={handlePublish}
                >
                  {isPublishing ? '启动中...' : '发布'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 图片弹框（微信二维码等） */}
      {showImgModal && imgModalSrc && (
        <div className="phone-modal-overlay" onClick={handleCloseImgModal}>
          <div className="phone-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
              <img
                src={'###'}
                alt="微信二维码"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '400px',
                  objectFit: 'contain',
                }}
              />
            </div>
            <button className="phone-modal-close" onClick={handleCloseImgModal}>
              <span>×</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Video
