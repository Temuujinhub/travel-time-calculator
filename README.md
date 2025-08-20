# Зорчих Цагийн Тооцоолуур (Travel Time Calculator)

Гэр, ажил, сургуулийн байршлыг Google Map-аас сонгож оруулж, өдөр тутмын зорчих цаг, сарын болон жилийн нийт цаг алдалтыг бодитоор тооцоолж харуулдаг web систем.

## 🌐 Live Demo
**GitHub Pages:** https://temuujinhub.github.io/travel-time-calculator/
**Backend API:** https://58hpi8cwq0vx.manus.space

## ✨ Онцлогууд

### 🏠 Байршил оруулах
- Google Places API ашиглан байршил хайх
- 3 байршил: Гэр, Сургууль, Ажил
- Монгол хэлний интерфейс

### 🚗 Зорчих цагийн тооцоолол
- Монгол хэв маягийн дараалал: Гэр → Сургууль → Ажил → Гэр
- Google Distance Matrix API ашиглан бодит зорчих цаг
- Өдөр тутмын маршрутын дэлгэрэнгүй breakdown

### 📊 Цаг алдалтын статистик
- Өдөр, сар, жилийн цаг алдалтын тооцоолол
- 7 хоногийн график (Bar chart)
- Дэлгэрэнгүй дүн шинжилгээ

### 🗺️ Google Maps интеграци
- Маршрут харуулах
- Интерактив газрын зураг
- Зорчих замын дүрслэл

### 👨‍💼 Админ хуудас
- Хайлтын түүх харах
- Excel файл татаж авах
- Статистик харах

## 🛠️ Технологи

### Frontend
- **React** + **Vite**
- **Tailwind CSS** - Responsive дизайн
- **Google Maps JavaScript API**
- **Google Places API**

### Backend
- **Flask** (Python)
- **SQLite** - Өгөгдлийн сан
- **Google Distance Matrix API**
- **CORS** дэмжлэг

## 🚀 Суулгах заавар

### 1. Repository clone хийх
```bash
git clone https://github.com/Temuujinhub/travel-time-calculator.git
cd travel-time-calculator
```

### 2. Dependencies суулгах
```bash
npm install
```

### 3. Google Maps API тохиргоо

#### Google Cloud Console дээр:
1. **Google Cloud Console** руу нэвтрэх: https://console.cloud.google.com/
2. **API & Services > Enabled APIs & services** хэсэг рүү орох
3. Дараах API-уудыг идэвхжүүлэх:
   - **Maps JavaScript API**
   - **Places API**
   - **Distance Matrix API**

#### API Key тохиргоо:
1. **API & Services > Credentials** хэсэг рүү орох
2. API key үүсгэх эсвэл одоо байгаа key-г тохируулах
3. **Application restrictions:**
   - "HTTP referrers (websites)" сонгох
   - Authorized domains нэмэх: `https://temuujinhub.github.io/*`
4. **API restrictions:**
   - "Restrict key" сонгох
   - Дээрх 3 API-г сонгох

#### Кодод API key оруулах:
```javascript
// src/App.jsx файлд
const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY_HERE';
```

### 4. Development режимд ажиллуулах
```bash
npm run dev
```

### 5. Production build хийх
```bash
npm run build
```

### 6. GitHub Pages-д deploy хийх
```bash
npm run deploy
```

## 📁 Файлын бүтэц

```
travel-time-calculator/
├── src/
│   ├── App.jsx                 # Үндсэн компонент
│   ├── components/
│   │   ├── WeeklyChart.jsx     # 7 хоногийн график
│   │   └── AdminPanel.jsx      # Админ хуудас
│   └── App.css
├── public/
├── package.json
├── vite.config.js
└── README.md
```

## 🎯 Ашиглах заавар

### Үндсэн хэрэглэгч:
1. **Байршил оруулах:** Гэр, сургууль, ажлын байрны хаягуудыг оруулна уу
2. **Тооцоолох:** "Цагийн алдагдлыг тооцоолох" товчийг дарна уу
3. **Үр дүн харах:** Зорчих цаг, цаг алдалтын статистик, 7 хоногийн график харна уу

### Админ хэрэглэгч:
1. **Админ хуудас:** `/admin` хаягаар орох
2. **Хайлтын түүх:** Бүх хайлтуудыг харах
3. **Excel татах:** Өгөгдлийг Excel файлаар татаж авах

## 🔒 Нууцлал

- Байршлын мэдээлэл локал дээр хадгалагдана
- Хэрэглэгчийн өгөгдөл хуваалцагдахгүй
- Админ хуудас зөвхөн статистикийн зорилгоор

## 📊 Системийн шаардлага

### Google Maps API Key тохиргоо:
- Maps JavaScript API идэвхжүүлэх
- Places API идэвхжүүлэх  
- Distance Matrix API идэвхжүүлэх
- Website restrictions: `https://temuujinhub.github.io/*`

### Browser дэмжлэг:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🐛 Алдаа мэдээлэх

GitHub Issues хэсэгт алдаа мэдээлж болно: https://github.com/Temuujinhub/travel-time-calculator/issues

## 📈 Хувилбарын түүх

### v3.0.0 (2025-08-20)
- ✅ GitHub Pages deployment
- ✅ Админ хуудас нэмэгдсэн
- ✅ Excel export функц
- ✅ Хайлтын түүх хадгалах
- ✅ Domain restrictions тохируулагдсан

### v2.0.0 (2025-08-20)
- ✅ UI дизайн шинэчлэгдсэн
- ✅ Google Maps интеграци сайжруулагдсан
- ✅ 7 хоногийн график нэмэгдсэн
- ✅ Google Sheets интеграци хасагдсан (нууцлалын үүднээс)

### v1.0.0 (2025-08-19)
- ✅ Анхны хувилбар
- ✅ Үндсэн функцууд

## 📄 License

MIT License - Дэлгэрэнгүй мэдээллийг LICENSE файлаас харна уу.

## 👨‍💻 Хөгжүүлэгч

Temuujin - [@Temuujinhub](https://github.com/Temuujinhub)

---

**Анхаарах зүйл:** Google Maps API key тохируулсны дараа бүх функц ажиллана. API key-г аюулгүй байдлын үүднээс зөвхөн тодорхой домэйнд хязгаарлаж тохируулна уу.

⭐ Хэрэв энэ төсөл танд тустай бол star өгөөрэй!

