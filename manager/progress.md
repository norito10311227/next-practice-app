# 進捗ログ

最終更新：2026-10-06（Claude Code セッション、`next-practice-app` リポジトリ）

## 現在地

- **W5（Next.js実践編）完了、W6（自力実装）も完了。W7（エラー処理・バリデーション・認証の深掘り）進行中。**
- W7は3段階に分けて自力実装中：①バリデーション強化（完了）→②エラーハンドリング改善（次）→③認証導入。
- `js-practice`→`react-practice`→`next-practice`（実験用）→`next-practice-app`（本実装）と、フェーズごとに別リポジトリで進めている。マネージャー一式（CLAUDE.md/manager/.claude）はこのリポジトリにも設置済み（2026-10-05、`next-practice`の消失騒ぎを受けて設置後すぐに学習者へcommit/pushを依頼すること）。

## 完了済み

| 項目 | 状態 | 備考 |
|---|---|---|
| Next.js環境構築 | 完了 | `create-next-app@14`で明示的にバージョン固定（`next-practice`で`@latest`が原因不明のキャッシュで14系になった経緯を踏まえ、今回は意図的に固定） |
| Udemy講座「Next.jsフルスタックWebアプリケーション開発入門」 | 視聴完了 | タスク管理アプリ（MongoDB+Mongoose、Server Actions、CRUD、Route Handler）を一通り実装 |
| W6：自力実装演習（優先度機能） | 完了 | 動画を見ずに、型・DBスキーマ・フォーム・表示まで一人で実装。詳細は下記 |
| W7-1：バリデーション強化 | 完了 | `createTask`/`updateTask`に`title`必須チェックと`dueDate`の未来日チェックを追加。詳細は下記 |

## アプリの構成（タスク管理アプリ）

- `src/models/task.ts`：`Task`インターフェース＋Mongooseスキーマ（MongoDB）
- `src/actions/task.ts`：`createTask`/`updateTask`/`deleteTask`（Server Actions）
- `src/app/api/tasks/`：Route Handler（`GET`、`dynamic = 'force-dynamic'`で都度最新データ取得）
- `src/app/(main)/page.tsx`：一覧ページ（Server Component、`fetch`で`/api/tasks`を叩く）
- `src/components/`：`NewTaskFrom`・`EditTaskForm`（Client Component、`useFormState`/`useFormStatus`）、`TaskCard`（Server Component、表示専用）

## 今回のセッションで解決したバグ・つまずき（すべて実物で確認済み）

- `layout.tsx`の`inter.className`が未定義変数参照 → 実際に定義されている`geistSans`に合わせて解決
- ファイル先頭の`"use client "`に余分なスペース → ディレクティブとして認識されず起きたエラー
- VS Codeの「problems」パネルに出る`ts(2882)`エラーが、コマンドラインの`tsc`では出ない → TypeScriptのワークスペース版と内蔵版の違い（Select TypeScript Version → Use Workspace Version）で解消
- `.next`フォルダへの誤編集 → 削除して自動再生成させて解決（ビルド成果物は手で直すものではない）
- `middleware.ts`の`export const middleWare`（大文字小文字違い）→ Next.jsが要求する厳密な`middleware`という名前に修正
- タスク編集してもカードに反映されない → **2段階のキャッシュ**が原因。① Route Handlerの`dynamic = 'force-dynamic'`（Handler自体の設定）と、② ページ側の`fetch`のキャッシュ（Next.js 14はデフォルト`force-cache`）は別物。`fetch(url, { cache: 'no-store' })`を追加して解決
- `TaskCard`内`key={task._id.toString}`（`()`付け忘れ、関数参照のままkeyに渡していた）

## W6：優先度機能の自力実装（2026-10-04〜05、動画なし）

学習者が設計を自分で考え、以下の順で実装。詰まった箇所はヒントのみで自力修正。

1. `Task`型に`priority: "高"|"中"|"低"`を追加
2. **つまずき**：Mongooseスキーマに`priority: { type: "高" | "中" | "低" }`と書いてしまい、TypeScriptの型構文（`|`）を値の場所で使うエラーに遭遇。「型を書く場所」と「値を書く場所」の違いをスキーマ全般の説明（TypeScript型は実行時に消える、Mongooseスキーマは実行時のルール）とともに解説 → `type: String, enum: ["高","中","低"]`で解決
3. `createTask`/`updateTask`で`formData.get('priority')`を取得して保存するよう修正。`as string`では`"高"|"中"|"低"`に代入できず型エラー → `as "高"|"中"|"低"`で解決（同じ構造のエラーが`EditTaskForm`の`onChange`でも再発したが、今度は自力で解決）
4. `NewTaskFrom`・`EditTaskForm`にセレクトボックスを追加（制御・非制御、両方のフォームパターンに対応させた）
5. `TaskCard`に優先度バッジを表示
6. 実機で動作確認（作成・一覧・編集）完了、口頭試問3問合格

### 口頭試問の結果（3問）
1. 型だけ追加してもDBに保存されない理由 → 合格（「スキーマの設定が必要だから」）
2. `as string`と`as "高"|"中"|"低"`の違い → 合格
3. Mongooseスキーマで`type: "高"|"中"|"低"`がダメな理由 → 最初「Mongooseにユニオン型がないから」と不正確な回答 → 「型を書く場所と値を書く場所の違い」と訂正して合格

## 学習者の傾向（今回新しく分かったこと）

- **同じ構造のバグ（`string`と狭いユニオン型の不一致）が別の場所（Server Actionの引数、Reactのイベントハンドラ）で再発したとき、2回目は自力で気づいて直せた。** パターン認識が育ってきている。
- **「わかるけど一人では作れない」という自己評価を正直に話せる**（2026-10-03）。チュートリアル完走後の自然なギャップとして受け止め、公式コース周回ではなく自力実装（W6）で対処する方針に切り替えた判断は妥当だった。
- Next.jsのキャッシュの多層構造（Route Handlerの`dynamic`、`fetch`のcache、ブラウザのルーターキャッシュ）は、動画だけでは拾いきれない実務的な落とし穴。都度、公式ドキュメントで裏取りしながら解説する必要がある。

## Vercelデプロイを試みた記録（2026-10-05）

学習者がVercelへのデプロイに挑戦し、複数の壁にぶつかった末、**W5の成果物からVercelデプロイを除外する判断をした**（デプロイの実践経験はW9・自作アプリ①＋Supabaseで改めて行う）。原因はほぼ特定済みなので、次回挑戦時の参考として記録する。

1. **GitHubの公開リポジトリに`.env`が誤ってコミットされていた**（`.gitignore`に`.env*.local`はあったが`.env`自体がなかった）。MongoDB Atlasの接続情報が公開されていたため、**Atlasのパスワードを変更**→`.env`をgit管理から除外→`.gitignore`に追記、の順で対応済み。**次回、新しいNext.jsプロジェクトを作るときは`.gitignore`に`.env`自体も入っているか最初に確認すること。**
2. Vercelは`main`ブランチをデフォルトでデプロイするが、作業はずっと`Branch2`で行っていたため、最初のデプロイは空のデフォルト画面になった。`Branch2`を`main`にマージして解決。
3. 本番ビルド（`next build`）はESLintのエラー（未使用の変数・import）で停止する。`npm run dev`では警告止まりで気づかなかった。`catch(error)`の`error`未使用、未使用のアイコンimportが該当。
4. ページ（`page.tsx`）がビルド時に事前レンダリングされようとして`fetch`が`ECONNREFUSED`で失敗。Route Handlerだけでなく、**ページ自体にも`export const dynamic = 'force-dynamic';`が必要**だった。
5. Vercel側の環境変数が最初の時点で**1つも登録されていなかった**（「No Environment Variables Added」）。`DB_URI`・`API_URL`を手動追加。
6. それでも`/api/tasks`が500エラー。Vercelの「Logs」タブで実際のエラーを確認する方法を学んだ。**最有力の原因はMongoDB Atlasのネットワークアクセス制限**（Vercelのサーバーは固定IPを持たないため、Atlas側で「Allow Access from Anywhere」の設定が必要）。ここで学習者が「今日はここまで」ではなく「デプロイ自体をやめる」と判断し終了。

## W7-1：バリデーション強化（2026-10-06、自力実装）

`src/actions/task.ts`の`createTask`/`updateTask`に以下を追加。

1. `title`が空なら`state.error`を設定して早期`return`（既存の`FormState`の仕組みを再利用）。
2. `dueDate`が今日より前なら弾く。実装は`new Date(dueDate) < new Date()`ではなく、**両方を`YYYY-MM-DD`形式の文字列に揃えて文字列比較**する方式（`toLocaleDateString('ja-JP', {...}).replace(/\//g, '-')`）。Dateオブジェクト同士の比較だと「今日」の時刻情報が罠になる（前回の回で学習者と確認済み）ことを踏まえた選択。

**つまずき**：最初`<=`で書いたため、「今日の日付」が意図と逆に弾かれてしまった（許容したいのに）。実験（Node.jsで実際に値を出して確認）で気づき、`<`に自力修正。

**口頭試問（1問）**：「なぜDateオブジェクト同士ではなく文字列同士で比較したか」→合格（「時刻までは含まれてなくて、日付だけで比較できるから」）。

## 次にやること

- W7-2：**エラーハンドリング改善**（次回ここから）。今は`alert()`でエラーを表示しているだけなので、もっと丁寧な表示方法に改善する自力実装を予定。
- W7-3：**認証導入**（誰でも他人のタスクを編集・削除できる現状に、ログインの壁をつける）。W7-2の後。
- W8（自作アプリ設計）に入る前に、テーマ選定（2026年11月中旬まで。「2年間育てたいと思えるもの」基準を追加済み）。
- W9でSupabase+Vercelデプロイに再挑戦するとき、今回の6項目（特に.gitignore・環境変数・Atlas/DB側のネットワーク許可に相当する設定）を先回りでチェックリストとして渡すこと。

## 保留事項（学習者から回収するもの）

- [ ] 研究室見学のアポ（香山研・小林研・北研）と日程 → **期限：2026年12月末までに最低1件**
- [ ] 研究室配属の時期、推薦特別選抜の学科内基準

## アプリ①テーマ決定（2026-10-05）

**「視聴ログ＋AI推薦」に決定。** 検討の経緯：
- 候補だった「音楽理論ツール」は、一般的な楽曲のコード進行データ（Hooktheory API・Chordonomicon、66万曲）は実在するが、**アニメ主題歌・劇伴に特化するとデータが存在しない**ことが判明し、2年育成には不向きと判断。
- 「視聴ログ＋AI推薦」は、作品側データ（タグ・ジャンル・スコア・AniList独自の「おすすめ」ペア）がAniListにすでに揃っており（W1〜W2で実装済み）、ユーザーの視聴ログ・評価はアプリ自体が生成するため、データ面の不安が最小。
- 以前のScreenLog（CRUD中心、react-learning-journeyのメモ参照）とは異なる切り口にする方針。候補：AI推薦を主役にする／似た感性のユーザーとマッチングする（2027年2月のベクトル検索学習ともつながる）。**具体的な機能設計はW8で確定する。**
- Web Audio APIの前倒し（音楽テーマだった場合の措置）は対象外になった。

## マネージャーの保留タスク

- [ ] 2026年11月：信州大 2028年4月入学（改組後）入試の予告を確認
- [ ] 2026年12月末：研究室見学アポの状況を確認
- [ ] 2027年1月：IPA の CBT 再開時期と新制度を確認し、FE／CS基礎の方針を決める
- [x] W8前：アプリ①のテーマ選定サポート（2026-10-05、「視聴ログ＋AI推薦」に決定）
- [ ] Vercelデプロイの実施（W9・Supabase移行時に再挑戦）
