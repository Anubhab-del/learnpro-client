import { Routes, Route } from 'react-router-dom'
import { AuthProvider }    from './context/AuthContext'
import Navbar              from './components/layout/Navbar'
import Footer              from './components/layout/Footer'
import ProtectedRoute      from './components/layout/ProtectedRoute'
import ChatbotWidget       from './components/chatbot/ChatbotWidget'

import Home          from './pages/Home'
import Courses       from './pages/Courses'
import CourseDetail  from './pages/CourseDetail'
import CoursePlayer  from './pages/CoursePlayer'
import Dashboard     from './pages/Dashboard'
import NotFound      from './pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="flex-1">
          <Routes>
            <Route path="/"            element={<Home />}         />
            <Route path="/courses"     element={<Courses />}      />
            <Route path="/courses/:id" element={<CourseDetail />} />

            {/* Course player — full screen, no footer */}
            <Route path="/learn/:id"   element={
              <ProtectedRoute><CoursePlayer /></ProtectedRoute>
            } />

            <Route path="/dashboard"   element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>

        {/* Footer and chatbot only shown outside the player */}
        <Routes>
          <Route path="/learn/*" element={null} />
          <Route path="*" element={
            <>
              <Footer />
              <ChatbotWidget />
            </>
          } />
        </Routes>
      </div>
    </AuthProvider>
  )
}