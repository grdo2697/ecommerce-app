import { Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import AIChatWidget from '../components/chat/AIChatWidget'
import WhatsAppButton from '../components/ui/WhatsAppButton'

const MainLayout = () => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main className="flex-grow page-transition"><Outlet /></main>
    <Footer />
    <AIChatWidget />
    <WhatsAppButton />
  </div>
)
export default MainLayout
