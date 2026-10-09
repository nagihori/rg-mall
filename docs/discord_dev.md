# Discord通知のテスト環境: 
別サーバーを作って環境変数だけで宛先を変えられます。通知の経路ごとに必要な変数は次のとおりです。

- *通知本体*: Webhook を使っています。別サーバーでチャンネルの Webhook を作り、DISCORD_REVIEW_WEBHOOK_URL を差し替えれば宛先が変わります。
- *確認者へのメンション*: DISCORD_REVIEWER_ROLE_ID も、そのサーバーのロールIDに差し替えます。差し戻し通知のメンションは、編集者本人のDiscord IDを使います。そのためテストサーバーにも本人がいないとメンションが飛びません。
- *Vercel 側*: Preview 環境にだけ上の2つを設定します。未設定のときは、今もコンソール出力だけでスキップします。
- *ログイン（OAuth）*: 今のDiscordアプリをそのまま使えます。Redirect URI は staging の固定URLで足ります。
- *スラッシュコマンド（/tccheck）*: Bot トークンと Interactions Endpoint URL が絡みます。テスト環境にも要るなら、テストサーバー用に別アプリを作るのが安全です。