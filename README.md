# Зорчих цагийн тооцоолуур - Travel Time Calculator

Гэр, ажил, сургуулийн байршлыг оруулж, өдөр тутмын зорчих цаг болон цаг алдалтыг тооцоолдог веб систем.

## Онцлогууд

- 🏠 Гэр, ажил, сургуулийн байршил оруулах
- 🚗 Зорчих цагийн тооцоолол
- 📊 Өдөр, сар, жилийн цаг алдалтын статистик
- 💾 Байршлыг хадгалах функц
- 📱 Responsive дизайн (компьютер болон утсанд тохирсон)

## Технологи

### Frontend
- React 18
- Tailwind CSS
- Shadcn/ui компонентууд
- Lucide иконууд

### Backend
- Flask (Python)
- SQLite өгөгдлийн сан
- RESTful API

## Суулгах заавар

### Шаардлага
- Python 3.11+
- Node.js 20+
- npm эсвэл pnpm

### Локал дээр ажиллуулах

1. Репозиторийг татах:
```bash
git clone <repository-url>
cd travel-time-backend
```

2. Python виртуал орчин үүсгэх:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# эсвэл
venv\Scripts\activate  # Windows
```

3. Python dependencies суулгах:
```bash
pip install -r requirements.txt
```

4. Flask серверийг эхлүүлэх:
```bash
python src/main.py
```

Серверийг http://localhost:5000 дээр нээнэ.

## API Endpoints

### POST /api/calculate-travel-time
Байршлуудын хоорондох зорчих цагийг тооцоолно.

**Request body:**
```json
{
  "home": "Улаанбаатар хот, Сүхбаатар дүүрэг",
  "work": "Улаанбаатар хот, Чингэлтэй дүүрэг", 
  "school": "Улаанбаатар хот, Баянзүрх дүүрэг"
}
```

### POST /api/calculate-time-loss
Цаг алдалтын статистикийг тооцоолно.

### POST /api/save-locations
Байршлуудыг хадгална.

### GET /api/load-locations
Хадгалагдсан байршлуудыг ачаална.

## Хөгжүүлэлт

Одоогоор mock өгөгдөл ашиглаж байна. Бодит Google Maps API ашиглахын тулд:

1. Google Cloud Console-д Google Maps API идэвхжүүлэх
2. API key авах
3. `src/routes/travel.py` файлд `GOOGLE_MAPS_API_KEY` өөрчлөх

## Лиценз

MIT License

## Хувь нэмэр оруулах

1. Fork хийх
2. Feature branch үүсгэх
3. Өөрчлөлт хийх
4. Pull request илгээх

