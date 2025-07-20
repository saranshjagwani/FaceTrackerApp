import Head from 'next/head';
import FaceRecorder from './components/FaceRecorder';
import { Navbar } from './components/Navbar';
import Features from './components/Features';
import Footer from './components/Footer';

/**
 * Home Page Component
 * 
 * Main landing page for the Face Tracking application.
 * Provides a clean, responsive layout with proper SEO meta tags
 * and seamless integration with the FaceRecorder component.
 */
export default function Home() {
  return (
    <>
       
      {/* Main Application Layout */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Navigation Header */}
        <Navbar/>

        {/* Main Content */}
        <main className="relative">
          

          

          {/* FaceRecorder Component */}
          <section className="pb-16">
            <FaceRecorder />
          </section>
          </main>

          <Features/>

          <section className="pt-12 pb-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-8">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                  AI-Powered
                  <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Face Detection
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Experience cutting-edge facial recognition technology with real-time landmark detection 
                  and seamless video recording capabilities.
                </p>
              </div>  
            </div>
          </section>


        {/* Footer */}
        <Footer/>
        
      </div>
    </>
  );
}