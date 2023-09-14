function buildAddOn(e) {
  /*
    const accessToken = e.messageMetadata.accessToken;
    GmailApp.setCurrentMessageAccessToken(accessToken);
  
    const id = e.messageMetadata.messageId;
    const msg = GmailApp.getMessageById(id);
    const subject = msg.getThread().getFirstMessageSubject();
  */
    const accessToken = e.messageMetadata.accessToken;
    GmailApp.setCurrentMessageAccessToken(accessToken);
    const id = e.messageMetadata.messageId;
    
    return [buildCard()];
}

function buildCard(responseMessage = '') {
    const createAction = CardService.newAction()
       .setFunctionName("createResponseMessage"); // ChatGPTが作成した文章をサイドメニューに表示する場合はこちらを利用
      // .setFunctionName("createReplyDraft");
    const createButton = CardService.newTextButton().setText('ChatGPTで返信内容作成する')
        .setOnClickAction(createAction);
    const section1 = CardService.newCardSection()
        .addWidget(createButton);

    const cardSection1Decorated = CardService.newTextParagraph()
        .setText(responseMessage);
    const section2 = CardService.newCardSection()
        .addWidget(cardSection1Decorated);

    const card = CardService.newCardBuilder()
        .addSection(section1)
        .addSection(section2)
        .build();

    return card;
}

function createResponseMessage(e) {
    const accessToken = e.messageMetadata.accessToken;
    GmailApp.setCurrentMessageAccessToken(accessToken);
  
    const id = e.messageMetadata.messageId;
    const msg = GmailApp.getMessageById(id);
    const responseMessage = chatgpt(msg.getPlainBody())

    const notify = CardService.newNotification().setText('返信案を作成しました。');
    return CardService.newActionResponseBuilder()
      .setNotification(notify)
      .setNavigation(CardService.newNavigation().updateCard(buildCard(responseMessage)))
      .setStateChanged(true)
      .build();
}

function createReplyDraft(e) {
    const accessToken = e.gmail.accessToken;
    GmailApp.setCurrentMessageAccessToken(accessToken);

    const messageId = e.gmail.messageId;
    const message = GmailApp.getMessageById(messageId);
    const draftMsg = chatgpt(message.getPlainBody());
    const draft = message.createDraftReply(draftMsg);

    return CardService.newComposeActionResponseBuilder()
      .setGmailDraft(draft).build();
}

function chatgpt(mailtext) {
    const apiKey = ScriptProperties.getProperty('OPENAI_API_KEY');
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
    };
    const messages = [
        {'role': 'system', 'content': 'あなたは優秀なビジネスマンです。与えられたメールに対しての返信メールを作成してください。'},
        {'role': 'user',   'content': '"""\n' + mailtext + '\n"""'}
    ];
    const payload = {
        "model": "gpt-3.5-turbo-16k",
        "messages": messages,
        "temperature": 0.8
    };
    const options = {
        'method': 'POST',
        'headers': headers,
        'payload': JSON.stringify(payload),
        "muteHttpExceptions": true
    };
    try {
        const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', options);
        const data = JSON.parse(response.getContentText());
        return data.choices[0].message.content;
    } catch (e) {
        Logger.error(e);
        return "";
    }
}

function test() {
    console.log("1");
    const a = chatgpt("色々とお手数をおかけ致します。ありがとうございました。");
    console.log(a);
    a = 'こんにちは';
    console.log(a);
}
