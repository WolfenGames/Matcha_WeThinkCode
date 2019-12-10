var availableTags = [];
var myCurrTags = [];
var map;
$(document).ready(function() {
	$("#deleteprofile").click(function() {
		var email = $("#hiddenemail").val();
		$.post("/delete", {
			email: email
		}).done(function(data) {
			var msg = JSON.parse(data);
			if (msg["msg"] != "OK") {
				$("#error-modal").modal();
				$("#errorModalTitle").html("Error has occured");
				if (msg["extra"])
					$("#errorModalText").html(
						msg["msg"] + "\nReason: " + msg["extra"]
					);
				else $("#errorModalText").html(msg["msg"]);
			} else {
				$("#error-modal").modal();
				$("#errorModalTitle").html("Account is deleted");
				$("#errorModalText").html("Redirecting to home page in 5s");
				setInterval(function() {
					location.replace("/logout/user");
				}, 5000);
			}
		});
	});
	//About me section
	$("#biographylength").html(
		"" +
			(150 - $("#biography").val().length).toString() +
			" characters left"
	);
	$("#biography").bind("input propertychange", function() {
		$("#biographylength").html(
			"" +
				(150 - $("#biography").val().length).toString() +
				" characters left"
		);
	});
	//Edit Sections --Username--
	var usernamehold;
	$(".username-label").click(function() {
		usernamehold = $(".username-label").text();
		$(this).hide();
		$(this)
			.siblings(".username-edit-input")
			.val(usernamehold);
		$(this)
			.siblings(".username-edit-input")
			.text(usernamehold);
		$(this)
			.siblings(".username-edit-input")
			.show();
		$(this)
			.siblings(".username-edit-input")
			.focus();
	});

	$(".username-edit-input").focusout(function() {
		$(this).hide();
		$(this)
			.siblings(".username-label")
			.text($(this).val())
			.show();
		var username = $(".username-label").text();
		$.post("/update/Username", {
			username: username
		}).done(function(data) {
			var msg = JSON.parse(data);
			if (msg["msg"] != "OK") {
				$("#error-modal").modal();
				$("#errorModalTitle").html("Error has occured");
				if (msg["extra"])
					$("#errorModalText").html(
						msg["msg"] + "\nReason: " + msg["extra"]
					);
				else $("#errorModalText").html(msg["msg"]);
				$(".username-label").text(usernamehold);
			}
		});
	});
	//Edit Sections --Email--
	var emailhold;
	$(".email-label").click(function() {
		emailhold = $(".email-label").text();
		$(this).hide();
		$(this)
			.siblings(".email-edit-input")
			.val(emailhold);
		$(this)
			.siblings(".email-edit-input")
			.text(emailhold);
		$(this)
			.siblings(".email-edit-input")
			.show();
		$(this)
			.siblings(".email-edit-input")
			.focus();
	});

	$(".email-edit-input").focusout(function() {
		$(this).hide();
		if ($(this).val() === null) $(this).text(emailhold);
		$(this)
			.siblings(".email-label")
			.text($(this).val())
			.show();
		var email = $(".email-label").text();
		$.post("/update/Email", {
			email: email
		}).done(function(data) {
			var msg = JSON.parse(data);
			if (msg["msg"] != "OK") {
				$("#error-modal").modal();
				$("#errorModalTitle").html("Error has occured");
				if (msg["extra"])
					$("#errorModalText").html(
						msg["msg"] + "\nReason: " + msg["extra"]
					);
				else $("#errorModalText").html(msg["msg"]);
			}
		});
	});

	//Biography update
	$("#biography").focusout(function() {
		var biographydata = $(this).val();
		$.post("/update/Biography", {
			biography: biographydata
		}).done(function(data) {
			var msg = JSON.parse(data);
			if (msg["msg"] != "OK") {
				$("#error-modal").modal();
				$("#errorModalTitle").html("Error has occured");
				if (msg["extra"])
					$("#errorModalText").html(
						msg["msg"] + "\nReason: " + msg["extra"]
					);
				else $("#errorModalText").html(msg["msg"]);
			}
		});
	});

	//Edit Sections --Firstname--
	var firstnamehold;
	$(".firstname-label").click(function() {
		firstnamehold = $(".firstname-label").text();
		$(this).hide();
		$(this)
			.siblings(".firstname-edit-input")
			.val(firstnamehold);
		$(this)
			.siblings(".firstname-edit-input")
			.text(firstnamehold);
		$(this)
			.siblings(".firstname-edit-input")
			.show();
		$(this)
			.siblings(".firstname-edit-input")
			.focus();
	});

	$(".firstname-edit-input").focusout(function() {
		$(this).hide();
		$(this)
			.siblings(".firstname-label")
			.text($(this).val())
			.show();
		var firstname = $(".firstname-label").text();
		$.post({
			url: "/update/Firstname",
			data: { firstname: firstname }
		}).done(function(data) {
			var msg = JSON.parse(data);
			if (msg["msg"] != "OK") {
				$("#error-modal").modal();
				$("#errorModalTitle").html("Error has occured");
				if (msg["extra"])
					$("#errorModalText").html(
						msg["msg"] + "\nReason: " + msg["extra"]
					);
				else $("#errorModalText").html(msg["msg"]);
				$(".username-label").text(firstnamehold);
			}
		});
	});

	//Edit Sections --Lastname--
	var lastnamehold;
	$(".lastname-label").click(function() {
		lastnamehold = $(".lastname-label").text();
		$(this).hide();
		$(this)
			.siblings(".lastname-edit-input")
			.val(lastnamehold);
		$(this)
			.siblings(".lastname-edit-input")
			.text(lastnamehold);
		$(this)
			.siblings(".lastname-edit-input")
			.show();
		$(this)
			.siblings(".lastname-edit-input")
			.focus();
	});

	$(".lastname-edit-input").focusout(function() {
		$(this).hide();
		$(this)
			.siblings(".lastname-label")
			.text($(this).val())
			.show();
		var lastname = $(".lastname-label").text();
		$.post("/update/Lastname", {
			lastname: lastname
		}).done(function(data) {
			var msg = JSON.parse(data);
			if (msg["msg"] != "OK") {
				$("#error-modal").modal();
				$("#errorModalTitle").html("Error has occured");
				if (msg["extra"])
					$("#errorModalText").html(
						msg["msg"] + "\nReason: " + msg["extra"]
					);
				else $("#errorModalText").html(msg["msg"]);
				$(".username-label").text(lastnamehold);
			}
		});
	});

	//Gender Selector update
	$("#GenderGroup").change(function() {
		var gender = $(this).val();
		$.post("/update/Gender", {
			gender: gender
		}).done(function(data) {
			var msg = JSON.parse(data);
			if (msg["msg"] != "OK") {
				$("#error-modal").modal();
				$("#errorModalTitle").html("Error has occured");
				if (msg["extra"])
					$("#errorModalText").html(
						msg["msg"] + "\nReason: " + msg["extra"]
					);
				else $("#errorModalText").html(msg["msg"]);
			}
		});
	});
	//Sexuality Selector update
	$("#SexualityGroup").change(function() {
		var sex = $(this).val();
		$.post("/update/Sex", {
			sex: sex
		}).done(function(data) {
			var msg = JSON.parse(data);
			if (msg["msg"] != "OK") {
				$("#error-modal").modal();
				$("#errorModalTitle").html("Error has occured");
				if (msg["extra"])
					$("#errorModalText").html(
						msg["msg"] + "\nReason: " + msg["extra"]
					);
				else $("#errorModalText").html(msg["msg"]);
			}
		});
	});

	//DOB update
	$("#DateOfBirth").focusout(function() {
		var dob = $(this).val();
		$.post("/update/Dob", {
			dob: dob
		}).done(function(data) {
			var msg = JSON.parse(data);
			if (msg["msg"] != "OK") {
				$("#error-modal").modal();
				$("#errorModalTitle").html("Error has occured");
				if (msg["extra"])
					$("#errorModalText").html(
						msg["msg"] + "\nReason: " + msg["extra"]
					);
				else $("#errorModalText").html(msg["msg"]);
			}
		});
	});

	$("#tags").keypress(function(e) {
		if (e.which == 13) {
			var tag = $(this).val();
			$(this).val("");
			$(this).text("");
			if (tag) {
				if (myCurrTags.indexOf(tag) === -1) {
					$("#likes-list").append(
						' <button class="tag-button" onclick="removeTag(\'' +
							tag +
							"', this)\">" +
							tag +
							"</button>"
					);
					myCurrTags.push(tag);
				}
				$.post("/tags/set", {
					tag: tag
				}).done(result => {
					$.get("/tags/get").done(result => {
						result.forEach(element => {
							if (availableTags.indexOf(element["Tag"]) === -1)
								availableTags.push(element["Tag"]);
							$("#tags").autocomplete({
								source: availableTags
							});
						});
					});
				});
			}
		}
	});

	//Update my list
	$.get("/tags/get/mine").done(result => {
		result.forEach(element => {
			myCurrTags.push(element);
		});
	});
	$.get("/tags/get").done(result => {
		result.forEach(element => {
			if (availableTags.indexOf(element["Tag"]) === -1)
				availableTags.push(element["Tag"]);
			$("#tags").autocomplete({
				source: availableTags
			});
		});
	});

	setInterval(function() {
		$.get("/tags/get").done(result => {
			result.forEach(element => {
				if (availableTags.indexOf(element["Tag"]) === -1)
					availableTags.push(element["Tag"]);
				$("#tags").autocomplete({
					source: availableTags
				});
			});
		});
	}, 10000);

	$("#MainImageUpload").click(() => {
		$("#Image1").on("change", function() {
			$("#MainPic").submit();
			$("#Image1")
				.get(0)
				.reset();
		});
		$("#Image1").click();
	});

	$("#FirstImageUpload").click(() => {
		$("#Image2").on("change", function() {
			$("#FirstPic").submit();
			$("#Image2")
				.get(0)
				.reset();
		});
		$("#Image2").click();
	});

	$("#SecondImageUpload").click(() => {
		$("#Image3").on("change", function() {
			$("#SecondPic").submit();
			$("#Image3")
				.get(0)
				.reset();
		});
		$("#Image3").click();
	});

	$("#ThirdImageUpload").click(() => {
		$("#Image4").on("change", function() {
			$("#ThirdPic").submit();
			$("#Image4")
				.get(0)
				.reset();
		});
		$("#Image4").click();
	});

	$("#FourthImageUpload").click(() => {
		$("#Image5").on("change", function() {
			$("#FourthPic").submit();
			$("#Image5")
				.get(0)
				.reset();
		});
		$("#Image5").click();
	});

	$("input[type=radio][name=locType]").change(e => {
		console.log($("input[name=locType]:checked").val());
		$.post("/user/locType", {
			locType: $("input[name=locType]:checked").val()
		}).done(() => location.reload());
	});
	google.maps.event.addListener(map, "click", function(event) {
		var latitude = event.latLng.lat();
		var longitude = event.latLng.lng();
		$.post("/update/loc/custom", {
			long: longitude,
			lat: latitude
		}).done();
	});
});

function initMap() {
	try {
		map = new google.maps.Map(document.getElementById("map"), {
			center: { lat: lat, lng: long },
			zoom: 10,
			disableDefaultUI: true
		});
	} catch (ex) {
		console.log(ex);
	}
}

function removeTag(tagname, el) {
	$.post("/tag/delete", { tag: tagname }).done(data => {
		$(el).remove();
		availableTags.splice(availableTags.indexOf(tagname), 1);
		myCurrTags.splice(myCurrTags.indexOf(tagname), 1);
	});
}
