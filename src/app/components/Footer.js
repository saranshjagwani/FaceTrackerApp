

const Footer = () => {
  return (
    <div>
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">FaceTracker AI</h3>
              </div>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Empowering developers and users with cutting-edge face detection technology. 
                Built with modern web standards and privacy in mind.
              </p>
              <div className="flex justify-center space-x-6 text-sm text-gray-500">
                <span>© 2025 FaceTracker AI</span>
                <span>•</span>
                <a href="#privacy" className="hover:text-blue-600 transition-colors duration-200">Privacy Policy</a>
                <span>•</span>
                <a href="#terms" className="hover:text-blue-600 transition-colors duration-200">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
        </div>
  )
}

export default Footer