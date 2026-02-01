import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { ConversionProvider } from './context/ConversionContext'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import DocumentPage from './pages/DocumentPage'
import ImagePage from './pages/ImagePage'
import AudioPage from './pages/AudioPage'
import VideoPage from './pages/VideoPage'
import BatchConverter from './pages/BatchConverter'
import HistoryPage from './pages/HistoryPage'
import ErrorPage from './pages/ErrorPage'

function App() {
    return (
        <ThemeProvider>
            <ConversionProvider>
                <Router>
                    <div className="app-wrapper">
                        <Header />
                        <main className="main-content">
                            <Routes>
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/document" element={<DocumentPage />} />
                                <Route path="/image" element={<ImagePage />} />
                                <Route path="/audio" element={<AudioPage />} />
                                <Route path="/video" element={<VideoPage />} />
                                <Route path="/batch" element={<BatchConverter />} />
                                <Route path="/history" element={<HistoryPage />} />
                                <Route path="*" element={<ErrorPage />} />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: 'var(--color-surface)',
                                color: 'var(--color-text-primary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '12px',
                                padding: '16px',
                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
                            }
                        }}
                    />
                </Router>
            </ConversionProvider>
        </ThemeProvider>
    )
}

export default App

