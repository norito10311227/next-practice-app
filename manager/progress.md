# 進捗ログ

最終更新：2026-10-05（Claude Code セッション、`next-practice-app` リポジトリ）

## 現在地

- **W5（Next.js実践編）完了、W6（自力実装）も完了。**
- `js-practice`→`react-practice`→`next-practice`（実験用）→`next-practice-app`（本実装）と、フェーズごとに別リポジトリで進めている。マネージャー一式（CLAUDE.md/manager/.claude）はこのリポジトリにも設置済み（2026-10-05、`next-practice`の消失騒ぎを受けて設置後すぐに学習者へcommit/pushを依頼すること）。

## 完了済み

| 項目 | 状態 | 備考 |
|---|---|---|
| Next.js環境構築 | 完了 | `create-next-app@14`で明示的にバージョン固定（`next-practice`で`@latest`が原因不明のキャッシュで14系になった経緯を踏まえ、今回は意図的に固定） |
| Udemy講座「Next.jsフルスタックWebアプリケーション開発入門」 | 視聴完了 | タスク管理アプリ（MongoDB+Mongoose、Server Actions、CRUD、Route Handler）を一通り実装 |
| W6：自力実装演習（優先度機能） | 完了 | 動画を見ずに、型・DBスキーマ・フォーム・表示まで一人で実装。詳細は下記 |

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

## 次にやること

- W7相当の内容（エラー処理・バリデーション・認証の深掘り）は、公式コース周回ではなく、**このアプリへの追加機能で自力実装を継続**する方針（学習者と相談の上、次回の機能を決める）。
- Vercelへの初回デプロイ（W5の元々の成果物）がまだ。
- W8（自作アプリ設計）に入る前に、テーマ選定（2026年11月中旬まで。「2年間育てたいと思えるもの」基準を追加済み）。

## 保留事項（学習者から回収するもの）

- [ ] 研究室見学のアポ（香山研・小林研・北研）と日程 → **期限：2026年12月末までに最低1件**
- [ ] 研究室配属の時期、推薦特別選抜の学科内基準

## マネージャーの保留タスク

- [ ] 2026年11月：信州大 2028年4月入学（改組後）入試の予告を確認
- [ ] 2026年12月末：研究室見学アポの状況を確認
- [ ] 2027年1月：IPA の CBT 再開時期と新制度を確認し、FE／CS基礎の方針を決める
- [ ] Vercelデプロイの実施
- [ ] W8前：アプリ①のテーマ選定サポート（11月中旬締切）
