$(document).ready(function(){
	$('#Login-Button').click(function() {
		var email = $('#email').val();
		var pass = $('#password').val();
		$.post('/User/Login', {
			Email: email,
			Password: pass
		}).done(function() {
            alert("Done");
		});
	});
});