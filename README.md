Gallery App — Dokumentacja

Autor - Hubert Moś

Cel aplikacji - Aplikacja pozwala użytkownikom na tworzenie galerii obrazków, zarządzanie nimi oraz komentowanie obrazków innych użytkowników.


Funkcjonalności:
  Dodawanie użytkowników
  Logowanie i wylogowanie użytkowników
  Dodawanie, edycja i usuwanie galerii (własnych)
  Dodawanie, edycja i usuwanie obrazków (własnych)
  Przeglądanie galerii innych użytkowników
  Komentarze do obrazków (tylko po zalogowaniu)
  Interfejs zabezpieczony autoryzacją
  Obsługa przesyłania i wyświetlania plików graficznych


Wykorzystane technologie:
  Node.js + Express
  MongoDB + Mongoose
  Pug (jako silnik widoków)
  Multer (upload plików)


Struktura kolekcji (modele):
  User: name, surname, username, password
  Gallery: name, description, user, date
  Image: name, description, path, gallery
  Comment: content, author, image, date


Ścieżki (przykłady):
  GET /galleries — lista galerii
  GET /galleries/gallery_add — formularz dodania galerii
  POST /images/image_add — dodanie obrazka
  GET /images/image_show?image_id=... — podgląd obrazka
  POST /images/image_comment/:image_id — dodanie komentarza


Instrukcja uruchomienia:
  Zainstaluj zależności: <code>npm install</code>
  Uruchom MongoDB lokalnie (domyślnie na <code>mongodb://localhost:27017/gallery</code>)
  Uruchom serwer: <code>npm start</code> lub <code>node ./bin/www</code>
  Wejdź na <code>http://localhost:3000</code>

