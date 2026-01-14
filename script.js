/* =========================
   STEP2：自作データ（商品）側
========================= */

// 初期データ
const items = [
  { name: 'りんご', price: 100 },
  { name: 'バナナ', price: 80 }
];

// 要素取得（商品）
const list = document.getElementById('list');
const form = document.getElementById('form');
const nameInput = document.getElementById('nameInput');
const priceInput = document.getElementById('priceInput');
const error = document.getElementById('error');

// 一覧を描画（商品）
function renderList() {
  list.innerHTML = '';

  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.name}：${item.price}円`;
    list.appendChild(li);
  });
}

// 初回描画
renderList();

// 追加フォーム送信（商品）
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const priceText = priceInput.value.trim();

  // バリデーション
  if (name === '' || priceText === '') {
    error.textContent = '商品名と価格を入力してください';
    error.style.display = 'block';
    return;
  }

  const priceNumber = Number(priceText);
  if (Number.isNaN(priceNumber) || priceNumber <= 0) {
    error.textContent = '価格は1以上の数字を入力してください';
    error.style.display = 'block';
    return;
  }

  // エラー消す
  error.style.display = 'none';

  // 追加
  items.push({ name, price: priceNumber });

  // 再描画
  renderList();

  // クリア
  nameInput.value = '';
  priceInput.value = '';
});


/* =========================
   STEP3：API（投稿）側（最終版）
   機能：API取得 / ローディング / エラー
        再読み込み / 件数切替 / 検索 / ローカル追加
========================= */

// 要素取得（投稿）
const postList = document.getElementById('postList');
const loading = document.getElementById('loading');
const apiError = document.getElementById('apiError');

const postForm = document.getElementById('postForm');
const postTitleInput = document.getElementById('postTitleInput');
const postError = document.getElementById('postError');

const reloadBtn = document.getElementById('reloadBtn');
const limitSelect = document.getElementById('limitSelect');
const searchInput = document.getElementById('searchInput');

// 状態：API投稿（元データ）とローカル投稿（追加分）
let apiPosts = [];
let localPosts = [];

// 表示対象を作る（検索・件数・結合）
function getVisiblePosts() {
  const limit = Number(limitSelect.value);
  const keyword = searchInput.value.trim().toLowerCase();

  // ローカルを先頭に、APIを後ろに
  const merged = [...localPosts, ...apiPosts];

  // 検索（タイトルに含む）
  const filtered = keyword === ''
    ? merged
    : merged.filter(p => (p.title ?? '').toLowerCase().includes(keyword));

  // 表示件数
  return filtered.slice(0, limit);
}

// 描画（投稿）
function renderPosts() {
  postList.innerHTML = '';

  const posts = getVisiblePosts();

  posts.forEach(post => {
    const li = document.createElement('li');
    li.textContent = post.title;
    postList.appendChild(li);
  });
}

// API取得（投稿）
async function fetchPosts() {
  loading.style.display = 'block';
  apiError.style.display = 'none';

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');

    if (!response.ok) {
      throw new Error('APIエラー');
    }

    const posts = await response.json();

    // APIは多めに保持（検索・件数切替に使う）
    apiPosts = posts.slice(0, 50);

    renderPosts();

  } catch (err) {
    apiError.style.display = 'block';
    console.error(err);

  } finally {
    loading.style.display = 'none';
  }
}

// ローカル投稿追加
postForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = postTitleInput.value.trim();

  if (title === '') {
    postError.textContent = 'タイトルを入力してください';
    postError.style.display = 'block';
    return;
  }

  postError.style.display = 'none';

  const newPost = {
    id: Date.now(),
    title,
    body: '',
    userId: 0
  };

  // 先頭に追加（新しい投稿を上に）
  localPosts.unshift(newPost);

  renderPosts();

  postTitleInput.value = '';
});

// 再読み込み
reloadBtn.addEventListener('click', () => {
  fetchPosts();
});

// 表示件数変更
limitSelect.addEventListener('change', () => {
  renderPosts();
});

// 検索
searchInput.addEventListener('input', () => {
  renderPosts();
});

// 初回取得
fetchPosts();
