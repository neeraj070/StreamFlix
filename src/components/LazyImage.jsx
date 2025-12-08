import { useState, useRef, useEffect } from 'react'

const LazyImage = ({ src, alt, className, placeholder = 'https://via.placeholder.com/300x450?text=Loading...', ...props }) => {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new Image()
            img.src = src
            img.onload = () => {
              setImageSrc(src)
              setIsLoaded(true)
            }
            img.onerror = () => {
              setImageSrc('https://via.placeholder.com/300x450?text=No+Image')
              setIsLoaded(true)
            }
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current)
      }
    }
  }, [src])

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-50'} transition-opacity duration-300`}
      {...props}
    />
  )
}

export default LazyImage


