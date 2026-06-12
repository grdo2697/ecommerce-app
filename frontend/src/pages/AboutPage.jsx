// ==================== AboutPage ====================
export { default as AboutPageDefault } from './AboutPage'

const AboutPage = () => (
  <div className="container-app py-14 max-w-4xl mx-auto">
    <div className="text-center mb-12">
      <h1 className="text-4xl font-black text-gray-800 mb-4">من نحن</h1>
      <p className="text-gray-500 text-lg">نحن أكثر من مجرد متجر، نحن وجهة تسوق متكاملة</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {[
        { emoji: '🚀', title: 'رؤيتنا', desc: 'أن نكون الوجهة الأولى للتسوق الإلكتروني في المنطقة العربية، بتجربة لا مثيل لها.' },
        { emoji: '💎', title: 'مهمتنا', desc: 'توفير أفضل المنتجات بأسعار تنافسية مع خدمة عملاء استثنائية وتوصيل سريع.' },
        { emoji: '🤝', title: 'قيمنا', desc: 'الأمانة والشفافية في التعامل، وضمان رضا عملائنا في كل خطوة.' },
      ].map(item => (
        <div key={item.title} className="card p-6 text-center">
          <div className="text-5xl mb-4">{item.emoji}</div>
          <h3 className="font-bold text-gray-800 text-lg mb-2">{item.title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
    <div className="card p-8 text-center bg-gradient-to-br from-primary-50 to-purple-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-3">قصتنا</h2>
      <p className="text-gray-600 leading-loose max-w-2xl mx-auto">
        بدأنا رحلتنا بحلم بسيط: جعل التسوق الإلكتروني أسهل وأكثر موثوقية للجميع.
        اليوم، نفخر بخدمة آلاف العملاء حول العالم العربي بمنتجات عالية الجودة ودعم لا ينتهي.
      </p>
    </div>
  </div>
)

export default AboutPage
