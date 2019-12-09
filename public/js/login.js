$(document).ready(function() {
	$(".loader").hide();
	$("#Login-Button").click(function(e) {
		e.preventDefault();
		var email = $("#email").val();
		var pass = $("#password").val();
		$(".loader").show();
		$(".login-form").hide();
		$.post("/login/user", {
			email: email,
			password: pass
		}).done(function(data) {
			var msg = jQuery.parseJSON(data);
			if (msg["msg"] != "OK") {
				$(".loader").hide();
				$(".login-form").show();
				$("#error-modal").modal();
				$("#errorModalTitle").html("Error has occured");
				$("#errorModalText").html(msg["msg"]);
			} else location.replace("/");
		});
	});
	$("#Resend-Button").click(function(e) {
		e.preventDefault();
		var email = $("#email").val();
		if (email != null) {
			$.post("/login/resend", {
				email: email
			}).done(function(data) {
				var msg = jQuery.parseJSON(data);
				if (msg["msg"] != "OK") {
					$("#error-modal").modal();
					$("#errorModalTitle").html("Error has occured");
					$("#errorModalText").html(msg["msg"]);
				} else {
					$("#error-modal").modal();
					$("#errorModalTitle").html("Email has been sent");
					$("#errorModalText").html(
						"Verification code has been resent"
					);
				}
			});
		} else {
			$("#error-modal").modal();
			$("#errorModalTitle").html("Error has occured");
			$("#errorModalText").html(
				"Please enter your email address associated with the account"
			);
		}
	});
	$("#Forgot-Button").click(function(e) {
		e.preventDefault();
		var email = $("#email").val();
		if (email != null) {
			$.post("/login/forgot", {
				email: email
			}).done(function(data) {
				var msg = jQuery.parseJSON(data);
				if (msg["msg"] != "OK") {
					$("#error-modal").modal();
					$("#errorModalTitle").html("Error has occured");
					$("#errorModalText").html(msg["msg"]);
				} else {
					$("#error-modal").modal();
					$("#errorModalTitle").html("Email has been sent");
					$("#errorModalText").html(
						"Forgot password email has been resent"
					);
				}
			});
		} else {
			$("#error-modal").modal();
			$("#errorModalTitle").html("Error has occured");
			$("#errorModalText").html(
				"Please enter your email address associated with the account"
			);
		}
	});
});
