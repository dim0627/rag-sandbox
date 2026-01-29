# RAG Sandbox

RAG（Retrieval-Augmented Generation）の仕組みを学習・実験するためのサンドボックス環境です。

## 技術スタック

| カテゴリ | 技術 | 説明 |
|---------|-----|------|
| 言語 | TypeScript | 型安全な開発 |
| ベクターDB | PostgreSQL + pgvector | HNSWインデックスによる高速類似検索 |
| ORM | Drizzle ORM | 型安全なDB操作、pgvectorネイティブサポート |
| Embeddings | OpenAI text-embedding-3-small | 1536次元のベクター生成 |
| LLM | OpenAI GPT-4o-mini | 回答生成 |
| CLI | Commander.js | コマンドラインインターフェース |

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLI Commands                            │
│                  (ingest / query / search)                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        RAG Pipeline                             │
│                      (src/rag/index.ts)                         │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│    Loader     │       │   Splitter    │       │   Embeddings  │
│  (Markdown)   │       │   (Chunk)     │       │   (OpenAI)    │
└───────────────┘       └───────────────┘       └───────────────┘
                                                        │
                                                        ▼
                                                ┌───────────────┐
                                                │  VectorStore  │
                                                │  (pgvector)   │
                                                └───────────────┘
                                                        │
                                                        ▼
                                                ┌───────────────┐
                                                │      LLM      │
                                                │   (OpenAI)    │
                                                └───────────────┘
```

## ディレクトリ構造

```
rag-sandbox/
├── docker-compose.yml      # PostgreSQL + pgvector
├── drizzle.config.ts       # Drizzle設定
├── drizzle/                # マイグレーションファイル
├── docs/                   # サンプルドキュメント
│   └── sample.md
└── src/
    ├── index.ts            # CLIエントリーポイント
    ├── config/             # 環境変数管理（Zod検証）
    ├── db/
    │   ├── schema.ts       # Drizzleスキーマ（pgvector）
    │   ├── index.ts        # DB接続
    │   └── migrate.ts      # マイグレーション実行
    ├── loader/
    │   └── markdown.ts     # Markdown/テキストファイル読み込み
    ├── splitter/
    │   └── index.ts        # チャンク分割（段落ベース）
    ├── embeddings/
    │   └── openai.ts       # OpenAI Embeddings生成
    ├── llm/
    │   └── openai.ts       # OpenAI Chat Completions
    ├── vectorstore/
    │   ├── store.ts        # ベクター保存
    │   ├── search.ts       # 類似検索（コサイン距離）
    │   └── index.ts
    ├── rag/
    │   └── index.ts        # パイプライン統合
    ├── commands/           # CLIコマンド
    │   ├── ingest.ts
    │   ├── query.ts
    │   └── search.ts
    └── types/
        └── index.ts        # 共通型定義
```

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env`ファイルを編集してOpenAI APIキーを設定:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. PostgreSQLの起動

```bash
docker compose up -d
```

### 4. マイグレーションの実行

```bash
pnpm db:migrate
```

## 使い方

### ドキュメントの取り込み (ingest)

ファイルまたはディレクトリをベクターDBに取り込みます。

```bash
# 単一ファイル
pnpm dev ingest ./docs/sample.md

# ディレクトリ（再帰的）
pnpm dev ingest ./docs --recursive
```

**処理フロー:**
1. Markdownファイルを読み込み（フロントマター解析）
2. 段落ベースでチャンク分割（デフォルト: 500文字、オーバーラップ50文字）
3. OpenAI APIでEmbedding生成
4. PostgreSQL + pgvectorに保存

### 質問応答 (query)

取り込んだドキュメントに基づいて質問に回答します。

```bash
pnpm dev query "TypeScriptの特徴は何ですか？"

# 検索結果数を指定
pnpm dev query "静的型付けとは？" --top-k 3
```

**処理フロー:**
1. 質問文のEmbedding生成
2. pgvectorで類似ドキュメント検索
3. 検索結果をコンテキストとしてLLMに渡す
4. 回答を生成

### ベクター検索のみ (search)

LLMを使わずにベクター検索のみを実行します（デバッグ用）。

```bash
pnpm dev search "TypeScript" --top-k 5
```

## 設定項目

`.env`で以下の設定が可能です:

| 環境変数 | デフォルト値 | 説明 |
|---------|-------------|------|
| `DATABASE_HOST` | localhost | PostgreSQLホスト |
| `DATABASE_PORT` | 5432 | PostgreSQLポート |
| `DATABASE_USER` | rag_user | DBユーザー |
| `DATABASE_PASSWORD` | rag_password | DBパスワード |
| `DATABASE_NAME` | rag_sandbox | DB名 |
| `OPENAI_API_KEY` | - | OpenAI APIキー（必須） |
| `EMBEDDING_MODEL` | text-embedding-3-small | Embeddingモデル |
| `CHAT_MODEL` | gpt-4o-mini | チャットモデル |
| `CHUNK_SIZE` | 500 | チャンクサイズ（文字数） |
| `CHUNK_OVERLAP` | 50 | チャンク間のオーバーラップ（文字数） |
| `TOP_K` | 5 | 検索結果数 |

## DBスキーマ

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata TEXT,
  source_file TEXT,
  chunk_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- HNSWインデックス（高速類似検索）
CREATE INDEX embedding_idx ON documents
  USING hnsw (embedding vector_cosine_ops);
```

## 開発コマンド

```bash
# 開発実行
pnpm dev <command>

# 型チェック
pnpm exec tsc --noEmit

# ビルド
pnpm build

# マイグレーション生成
pnpm db:generate

# マイグレーション実行
pnpm db:migrate

# Drizzle Studio（DBブラウザ）
pnpm db:studio
```

## 学習ポイント

このサンドボックスでは以下のRAGコンポーネントを自作して理解を深められます:

1. **Document Loader**: ファイル形式に応じた読み込みとメタデータ抽出
2. **Text Splitter**: 適切なサイズへのチャンク分割戦略
3. **Embeddings**: テキストからベクターへの変換
4. **Vector Store**: pgvectorを使った類似検索
5. **RAG Pipeline**: 各コンポーネントの統合

## 拡張アイデア

- [ ] Reranking（検索結果の再ランキング）
- [ ] Hybrid Search（全文検索との組み合わせ）
- [ ] Streaming（回答のストリーミング出力）
- [ ] Web UI（Next.js等）
- [ ] 異なるEmbeddingsモデル対応
- [ ] セマンティックチャンキング
- [ ] メタデータフィルタリング
