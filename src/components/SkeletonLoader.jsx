import { useTheme } from '../context/ThemeContext'

const SkeletonLoader = ({ count = 1, className = '' }) => {
  const { isDark } = useTheme()
  
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`rounded-lg overflow-hidden ${className} animate-pulse`}
        >
          <div className={`skeleton w-full h-80 ${isDark ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
          <div className="p-4 space-y-3">
            <div className={`skeleton h-6 w-3/4 ${isDark ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
            <div className={`skeleton h-4 w-1/2 ${isDark ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
            <div className="flex justify-between">
              <div className={`skeleton h-6 w-20 ${isDark ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
              <div className={`skeleton h-8 w-8 rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default SkeletonLoader

