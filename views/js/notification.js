function checkNotifications() {
    console.log("GG")
    $.post('/notification/new').done(res => {
        console.log(res);
        if (res == true) {
            if ( document.getElementById("notification").style.color == 'grey') {
               document.getElementById("notification").style.color = 'red';
            }
        } else {
            if ( document.getElementById("notification").style.color == 'red')
            {
                document.getElementById("notification").style.color = 'grey';
            }
        }
    });
};

setInterval(checkNotifications(), 5);