/* eslint-disable */
window.onload = function () {
	document.getElementById('upload').onclick = function () {
    var data = new FormData();
		var form = document.getElementById('uploadForm');
		var files = form.file.files;

		if(document.getElementById('edit').checked && files.length > 1)
			return alert('Don\'t run edit with more than one files!');

		for(var i=0; i<files.length; i++) {
			var item = files.item(i);
			data.append(i, item, item.name);
		}

		for(var i=1; i<form.length-1; i++) {
			var x = form.elements[i],
				val = x.type === 'checkbox' ? x.checked : x.value;
			if(x.type === 'button')
				continue;
			data.append(x.name, val);
		}

		post('upload', data);
	}

	document.getElementById('dev').onclick = function () {
		document.getElementById('labelsoft').style.display = 'inline';
		document.getElementById('labeltest').style.display = 'inline';
		document.getElementById('dev').style.display = 'none';
	}
}

function specialForm() {
	var data = new FormData();
	var form = document.getElementById('specialForm');

	if(form.special.value === 'download')
		return true;
	else {
		for(var i=0; i<form.length-1; i++) {
			var x = form.elements[i],
				val = x.type==='checkbox' ? x.checked : x.value
			if(x.value !== 'download')
				data.append(x.name, val);
		}
		post('special', data);
	}
	return false;
}

function post(page, data) {
	axios.post('/' + page, data, {
		headers: {
				'Content-Type': 'multipart/form-data'
		}
	}).then(function (res) {
			alert('Success!');
		}).catch(function (err) {
			alert('Error: ' + err.response.data);
		});
}
