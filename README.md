# Random Key Admin Generator

ছোট static ওয়েবসাইট। ব্রাউজারে `index.html` খুললেই চলবে।

লোকাল সার্ভার দিয়ে চালাতে:

```bash
npm start
```

তারপর খুলুন: `http://127.0.0.1:8777`

## Login

- Default admin password: `admin123`
- অ্যাডমিন প্যানেল থেকে পাসওয়ার্ড বদলানো যাবে।
- পাসওয়ার্ড, settings এবং history ব্রাউজারের `localStorage`-এ সেভ থাকে।

## Features

- Prefix এবং suffix রেখে random অংশ তৈরি
- Length preset: 3, 5, 7, 8, 10, 16
- Letters, numbers, symbols, arrows এবং custom character pool
- Batch generation
- Four-corner style result boxes
- Copy single code, copy all, copy history batch
