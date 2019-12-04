class Message {
    constructor(sender, text, date)
    {
        this.sender = sender;
        this.text = text;
        this.date = date;
    }
}

module.exports = {
    Message: Message
}