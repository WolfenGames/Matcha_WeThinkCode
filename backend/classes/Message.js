class Message {
	constructor(roomName, sender, text, date) {
		this.roomName = roomName;
		this.sender = sender;
		this.text = text;
		this.date = date;
	}
}

module.exports = {
	Message: Message
};
