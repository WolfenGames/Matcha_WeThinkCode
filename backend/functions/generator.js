const fs = require('fs')
const userSave = require('./userSave');

function UserGenerator() {
    fs.readFile('./backend/data/firstnames.txt', 'utf8', (err, fNames) => {
        fs.readFile('./backend/data/surname.txt', 'utf8', (err2, sNames) => {
            fs.readFile('./backend/data/likes.txt', 'utf8', (err3, likes) => {
                fNames = fNames.split('\n');
                sNames = sNames.split('\n');
                likes = likes.split('\n');
                var i = 0;
                var Users = {};
                for(var i = 0; i < 1; i++)
                {
                    var x = Math.floor(Math.random() * fNames.length);
                    var y = Math.floor(Math.random() * sNames.length);
                    var likeCountMax = Math.floor(Math.random() * likes.length);
                    var likesArray = [];
                    for (var j = 0; j < likeCountMax; j++)
                    {
                        var val = Math.floor(Math.random() * likes.length);
                        if (likesArray.indexOf(likes[val].trim('\r')) == -1)
                            likesArray.push(likes[val].trim('\r'));
                    }
                    var age = 18 + Math.floor(Math.random() * 50);
                    var bio = "This is a random Biography made for purpose of testing, I serve no other purpose, please ignore";
                    var sexuality = Math.floor(Math.random() * 3) + 1;
                    var sex = Math.floor(Math.random() * 3) + 1;
                    var first = fNames[x];
                    var second = sNames[y];
                    var email = first.trim('\r') + "::" + second.trim('\r') + (Math.floor(Math.random() * 2018) + i).toString() + "@bogusEmail.com";
                    userSave.generatedUser(first, second, email, age, bio, likesArray, sex, sexuality);
                }
            })
        })
    })
}

module.exports = {
    UserGenerator: UserGenerator
}