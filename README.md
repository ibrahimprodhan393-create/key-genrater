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

## Vercel Deploy

Vercel-এ `Install Command` হিসেবে `npm start` দেবেন না। এই সাইট static, তাই build-এর সময় server চালানোর দরকার নেই।

- Framework Preset: `Other`
- Install Command: খালি রাখুন
- Build Command: `echo No build needed`
- Output Directory: `.`

এই প্রোজেক্টে `vercel.json` দেওয়া আছে, তাই GitHub থেকে redeploy করলে Vercel এই সেটিংস নিজে নিতে পারবে।

## Render Deploy

Static Site হিসেবে দিলে:

- Build Command: `echo No build needed`
- Publish Directory: `.`

Web Service হিসেবে দিলে:

- Build Command: `npm install`
- Start Command: `HOST=0.0.0.0 npm start`
