# JS-SDKを学ぶ
## ミニマムゴール
  - [x] 複数人会議アプリをv3を使って作ってもらう
      - [x] 部屋名を入力し、入室する
      - [x] 同じ部屋名を入れた人たちが、P2Pを用いて映像と音声で通話できる
    - [x] トークンの生成はここではクライアントサイドで実施する
## 追加要件（優先度順）
  - [x] SFUで通話するかP2Pで通話するか部屋名を入れる際に選べる
  - [x] 入室時に使うマイクと、カメラを選択することが出来る
  - [x] ボタンを押したら音声をミュートできる
    - やり方はいろいろある
    - [x] SDK disable
    - [ ] gain 0
    - [ ] mediaStream track disable
  - [x] ボタンを押したら画面を共有することが出来る
  - [x] SFUのときにサイマルキャストを利用して、複数解像度で映像を送信できる
    - [x] 送信するビットレートとフレームレートを制限するオプションがある
  - [x] ここまでで作ったアプリをCoreで書き直す
  - [x] SkyWay提供の仮想背景ライブラリを使ってみる
  - [x] トークンの生成をサーバサイドで実施する