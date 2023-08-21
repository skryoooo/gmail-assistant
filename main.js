function buildAddOn(e) {
  /*
    const accessToken = e.messageMetadata.accessToken;
    GmailApp.setCurrentMessageAccessToken(accessToken);
  
    const id = e.messageMetadata.messageId;
    const msg = GmailApp.getMessageById(id);
    const subject = msg.getThread().getFirstMessageSubject();
  */
    return [buildCard()];
  }

function buildCard(responseMessage = '') {
    const createAction = CardService.newAction()
       //.setFunctionName("createResponseMessage");
       .setFunctionName("createReplyDraft");
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

    var notify = CardService.newNotification().setText('返信案を作成しました。');
    return CardService.newActionResponseBuilder()
      .setNotification(notify)
      .setNavigation(CardService.newNavigation().updateCard(buildCard(responseMessage)))
      .setStateChanged(true)
      .build();
}

function createReplyDraft(e) {
    var accessToken = e.gmail.accessToken;
    GmailApp.setCurrentMessageAccessToken(accessToken);

    var messageId = e.gmail.messageId;
    var message = GmailApp.getMessageById(messageId);
    Logger.log(message.getPlainBody());
    var draft = message.createDraftReply(chatgpt(message.getPlainBody()));

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
        {'role': 'system', 'content': 'あなたは優秀なビジネスマンです。与えられたメールのテキストをもとに返信の内容を生成してください。'},
        {'role': 'user',   'content': mailtext}
    ];
    var payload = {
        "model": "gpt-3.5-turbo-16k",
        "messages": messages,
        "temperature": 0.8
    };
    var options = {
        'method': 'POST',
        'headers': headers,
        'payload': JSON.stringify(payload),
        "muteHttpExceptions": true
    };
    try {
        var response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', options);
    } catch (e) {
        Logger.error(e);
    }
    var data = JSON.parse(response.getContentText());
    return data.choices[0].message.content;
}

function test() {
    console.log("1");
    const a = chatgpt("色々とお手数をおかけ致します。ありがとうございました。");
    console.log(a)
}
