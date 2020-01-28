setInterval(function() {
    {
        $.post('/notification/new').done(res => {
            if (res === "true") {
                if ( document.getElementById("notification").style.color != 'red') {
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
}, 1000);
