# Зорчих цагийн тооцоолуур - Travel Time Calculator

Гэр, сургууль, ажлын хооронд зорчих цагийг тооцоолж, цаг алдалтыг харуулдаг веб систем. Google Maps API ашиглан бодит зорчих цагийг тооцоолж, Google Sheets-д автоматаар хадгалдаг.

## 🌟 Онцлогууд

- 🏠 **Байршил оруулах:** Гэр, сургууль, ажлын байршлыг Google Maps-аас хайж сонгох
- 🚗 **Бодит зорчих цаг:** Google Distance Matrix API ашиглан бодит зорчих цагийг тооцоолох
- 📊 **Цаг алдалтын статистик:** Өдөр, сар, жилийн цаг алдалтыг харуулах
- 🇲🇳 **Монгол хэв маяг:** Гэр → Сургууль → Ажил → Гэр дарааллаар тооцоолох
- 📈 **Google Sheets интеграци:** Тооцооллын түүхийг автоматаар хадгалах
- 📱 **Responsive дизайн:** Компьютер болон утсанд тохирсон

## 🛠 Технологи

### Frontend
- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality UI components
- **Lucide Icons** - Beautiful icons

### Backend
- **Flask** - Python web framework
- **Google Maps APIs:**
  - Distance Matrix API - Зорчих цаг тооцоолох
  - Places API - Байршил хайх
  - Maps JavaScript API - Газрын зураг харуулах
- **Google Sheets API** - OAuth 2.0 ашиглан өгөгдөл хадгалах

## 🚀 Суулгах заавар

### 1. Repository clone хийх

```bash
git clone https://github.com/Temuujinhub/travel-time-calculator.git
cd travel-time-calculator
```

### 2. Backend тохиргоо

```bash
# Virtual environment үүсгэх
python -m venv venv
source venv/bin/activate  # Linux/Mac
# эсвэл
venv\Scripts\activate  # Windows

# Dependencies суулгах
pip install -r requirements.txt
```

### 3. Google APIs тохиргоо

#### Google Maps API
1. [Google Cloud Console](https://console.cloud.google.com/) руу нэвтрэх
2. Шинэ project үүсгэх эсвэл одоо байгаагаа сонгох
3. Дараах API-удыг идэвхжүүлэх:
   - Maps JavaScript API
   - Places API
   - Distance Matrix API
4. API key үүсгэх:
   - **Application restrictions:** HTTP referrers
   - **Website restrictions:** Таны domain нэмэх
   - **API restrictions:** Дээрх 3 API-г сонгох

#### Google Sheets API
1. Google Cloud Console дээр Google Sheets API идэвхжүүлэх
2. OAuth 2.0 Client ID үүсгэх:
   - **Application type:** Web application
   - **Authorized redirect URIs:** `http://localhost:5000/api/oauth2callback`
3. Client secret JSON файлыг татаж авах
4. `src/config/client_secret.json` байршилд хадгалах

### 4. Environment variables

`src/routes/travel.py` файлд API key-г оруулах:
```python
GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"
```

### 5. Ажиллуулах

```bash
# Backend ажиллуулах
cd src
python main.py

# Frontend build хийх (өөр terminal дээр)
cd ../frontend
npm install
npm run build
cp -r dist/* ../src/static/
```

Веб хөтчөөр `http://localhost:5000` руу орох.

## 📖 Ашиглах заавар

### 1. Байршил оруулах
- Гэр, сургууль, ажлын хаягуудыг оруулна уу
- Google Places API автоматаар санал болгох
- "Хадгалах" товчоор байршлыг хадгална

### 2. Google Sheets холболт
- "Google-тэй холбогдох" товчийг дарна
- Google account-аар нэвтэрч зөвшөөрөл өгнө
- Автоматаар spreadsheet үүсгэгдэнэ

### 3. Тооцоолол хийх
- "Тооцоолох" товчийг дарна
- Бодит зорчих цаг болон статистик харагдана
- Google Sheets-тэй холбогдсон бол автоматаар хадгалагдана

## 🔧 Хөгжүүлэлт

### Project бүтэц
```
travel-time-calculator/
├── src/
│   ├── main.py              # Flask application
│   ├── routes/
│   │   ├── travel.py        # Travel time calculation
│   │   └── sheets.py        # Google Sheets integration
│   ├── config/
│   │   └── client_secret.json  # Google OAuth credentials
│   └── static/              # React build files
├── frontend/                # React source code
├── requirements.txt         # Python dependencies
└── README.md
```

### API Endpoints

#### Travel Routes
- `POST /api/calculate-travel-time` - Зорчих цаг тооцоолох
- `POST /api/calculate-time-loss` - Цаг алдалт тооцоолох
- `POST /api/search-places` - Байршил хайх
- `POST /api/save-locations` - Байршил хадгалах
- `GET /api/load-locations` - Байршил ачаалах

#### Google Sheets Routes
- `GET /api/auth-google` - Google OAuth эхлүүлэх
- `GET /api/oauth2callback` - OAuth callback
- `GET /api/check-auth` - Authentication шалгах
- `POST /api/create-spreadsheet` - Spreadsheet үүсгэх
- `POST /api/save-to-sheets` - Өгөгдөл хадгалах
- `POST /api/logout` - Гарах

## 🌐 Deployment

### Manus Cloud Platform дээр deploy хийх
```bash
# Backend deploy
manus deploy backend --framework flask --project-dir .

# Frontend deploy (хэрэв тусад нь deploy хийх бол)
manus deploy frontend --framework react --project-dir frontend
```

### Бусад платформ дээр deploy хийх
1. Environment variables тохируулах
2. Google APIs-ийн domain restrictions шинэчлэх
3. OAuth redirect URIs шинэчлэх

## 🔒 Аюулгүй байдал

- API key-үүдийг environment variables-д хадгална
- Google OAuth 2.0 ашиглан аюулгүй authentication
- Client secret файлыг .gitignore-д оруулсан
- CORS тохиргоо хийсэн

## 🤝 Хувь нэмэр оруулах

1. Repository-г fork хийх
2. Feature branch үүсгэх (`git checkout -b feature/amazing-feature`)
3. Өөрчлөлтөө commit хийх (`git commit -m 'Add amazing feature'`)
4. Branch-аа push хийх (`git push origin feature/amazing-feature`)
5. Pull Request үүсгэх

## 📝 License

MIT License - дэлгэрэнгүй мэдээллийг [LICENSE](LICENSE) файлаас үзнэ үү.

## 👨‍💻 Хөгжүүлэгч

**Temuujin** - [@Temuujinhub](https://github.com/Temuujinhub)

## 🙏 Талархал

- [Google Maps Platform](https://developers.google.com/maps) - Maps APIs
- [Google Sheets API](https://developers.google.com/sheets) - Spreadsheet integration
- [React](https://reactjs.org/) - Frontend framework
- [Flask](https://flask.palletsprojects.com/) - Backend framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

⭐ Хэрэв энэ төсөл танд тустай бол star өгөөрэй!

