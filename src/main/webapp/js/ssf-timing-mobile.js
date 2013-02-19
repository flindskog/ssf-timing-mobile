// Load pages in windows-1252 charset
$.ajaxSetup({
	'beforeSend' : function(xhr) {
		if (xhr.overrideMimeType) {
			xhr.overrideMimeType('text/html; charset=windows-1252');
		} else {
			xhr.setRequestHeader('Content-type',
					'text/html; charset=windows-1252');
		}
	},
});

$.mobile.listview.prototype.options.filterPlaceholder = "Filtrera...";
$.mobile.loader.prototype.options.text = "Laddar...";
$.mobile.loader.prototype.options.textVisible = true;

var Global = {
	selectedResultUrl : null,
	selectedResultHeader : null,
	getTemplate : function(templateName) {
		if (!Global._compiledTemplates[templateName]) {
			Global._initHelpers();
			Global._compiledTemplates[templateName] = Handlebars.compile($(
					templateName).html());
		}
		return Global._compiledTemplates[templateName];
	},
	_initHelpers : function() {
		if (!Global._initedTemplates) {
			Handlebars.registerHelper('substr', function(start, end, context) {
				return context.substring(start, end);
			});
			Global._initedTemplates = true;
		}
	},
	_compiledTemplates : {},
	_initedTemplates : false
};

$(document).ready(
		function() {
			$('#refreshButton').bind(
					"click",
					function(event, ui) {
						getResult(Global.selectedResultUrl,
								Global.selectedResultHeader, function() {
									$('#reloadMessage').slideDown();
									$('#reloadMessage').fadeOut(5000);
								});
					});
		});

$('#mainPage').live('pageinit', function() {
	$("#mainUl").delegate(".listUlItem", "click", function() {
		getResult(this.id, this.innerText);
	});

	$.mobile.showPageLoadingMsg();
	var url = 'Menu.htm';
	$.get(url, {
		cache : false
	}, function(htmlText) {
		html = $(htmlText);
		var table = html.siblings('table').first();
		var jsonObj = parseMenuTable(table);

		getDataForTemplate({
			json : jsonObj,
			ul : '#mainUl',
			template : Global.getTemplate('#event-template'),
		});
	});
	$.ajax({
		url : url,
		cache : false,
		success : function(htmlText) {
			html = $(htmlText);
			var table = html.siblings('table').first();
			var jsonObj = parseMenuTable(table);

			getDataForTemplate({
				json : jsonObj,
				ul : '#mainUl',
				template : Global.getTemplate('#event-template'),
			});
		},
		error : function() {
			alert("Sidan kunde inte laddas.");
		},
		complete : function() {
			$.mobile.hidePageLoadingMsg();
		}
	});
});

function parseMenuTable(table) {
	var json = table.find("tr").map(function() {
		var link = $(this).find("a").attr("href");
		if (link) {
			return {
				link : {
					url : $(this).find("a").attr("href"),
					label : $(this).text()
				}
			};
		} else if (trim($(this).text())) {
			return {
				group : $(this).text()
			};
		} else {
			return null;
		}
	}).get();
	return json;
}

function trim(string) {
	return string.replace(/\s/g, "").replace(/\u00a0/g, "");
}

$('#resultPage').live('pageinit', function() {
	if (Global.selectedResultUrl == null) {
		$.mobile.changePage($('#mainPage'));
	}
});

function getResult(url, header, successCallback) {
	Global.selectedResultUrl = url;
	Global.selectedResultHeader = header;

	$.mobile.showPageLoadingMsg();
	$('input[data-type="search"]').val("");
	$.ajax({
		url : url,
		cache : false,
		success : function(htmlText) {
			if (url.indexOf("startlist") != -1) {
				$('#resultHeader').text("Startlista " + header);
				var html = $(htmlText);
				var startTable = html.siblings('table').first();

				var json = parseStartTable(startTable);

				getDataForTemplate({
					json : json,
					ul : '#resultUl',
					template : Global.getTemplate('#startlist-template')
				});
			} else if (url.indexOf("finish") != -1) {
				$('#resultHeader').text("Resultat " + header);
				var html = $(htmlText);
				var okTable = html.siblings('table').first();
				var failTable = html.siblings('table').last();

				var okJson = parseOkTableFinish(okTable);
				var failJson = parseFailTable(failTable);

				var jsonObj = {
					ok : okJson,
					fail : failJson
				};

				getDataForTemplate({
					json : jsonObj,
					ul : '#resultUl',
					template : Global.getTemplate('#result-template'),
				});
			}
			else {
				$('#resultHeader').text("Resultat " + header);
				var html = $(htmlText);
				var okTable = html.siblings('table').first();
				var failTable = html.siblings('table').last();

				var okJson = parseOkTable(okTable);
				var failJson = parseFailTable(failTable);

				var jsonObj = {
					ok : okJson,
					fail : failJson
				};

				getDataForTemplate({
					json : jsonObj,
					ul : '#resultUl',
					template : Global.getTemplate('#result-template'),
				});
			}
			$.mobile.changePage($('#resultPage'), {
				transition: "slidefade"
			});
			if (successCallback) {
				successCallback();
			}
		},
		error : function() {
			alert("Sidan kunde inte laddas.");
		},
		complete : function() {
			$.mobile.hidePageLoadingMsg();
		}
	});
}

function parseOkTable(table) {
	var json = table.find("tr").map(function() {
		var $row = $(this);
		return {
			place : $row.find(':nth-child(1)').text(),
			name : $row.find(':nth-child(2)').text(),
			number : trim($row.find(':nth-child(3)').text()),
			club : $row.find(':nth-child(4)').text(),
			time : $row.find(':last-child').prev().text(),
			diff : $row.find(':last-child').text()
		};
	}).get();
	json.splice(0, 3);
	return json;
}

function parseOkTableFinish(table) {
	var json = table.find("tr").map(function() {
		var $row = $(this);
		return {
			place : $row.find(':nth-child(1)').text(),
			name : $row.find(':nth-child(2)').text(),
			number : trim($row.find(':nth-child(3)').text()),
			club : $row.find(':nth-child(4)').text(),
			time1 : $row.find(':nth-child(6)').prev().text(),
			time2 : $row.find(':nth-child(7)').prev().text(),
			time : $row.find(':nth-child(8)').prev().text(),
			diff : $row.find(':last-child').text()
		};
	}).get();
	json.splice(0, 3);
	return json;
}

function parseFailTable(table) {
	var json = table.find("tr").map(function() {
		var $row = $(this);
		return {
			code : $row.find(':nth-child(1)').text(),
			name : $row.find(':nth-child(2)').text(),
			number : trim($row.find(':nth-child(3)').text()),
			club : $row.find(':nth-child(4)').text()
		};
	}).get();
	json.splice(0, 2);
	return json;
}

function parseStartTable(table) {
	var json = table.find("tr").map(function() {
		var $row = $(this);
		var num = $row.find(':nth-child(1)');
		if (num.children().size() == 1) {
			num = num.find(':nth-child(1)');
		}
		return {
			number : num.text(),
			name : $row.find(':nth-child(2)').text(),
			club : $row.find(':nth-child(3)').text()
		};
	}).get();
	json.splice(0, 2);
	return json;
}

function getDataForTemplate(config) {
	var data = {
		items : config.json
	};

	if (config.dataProcessFnc != undefined) {
		config.dataProcessFnc(data);
	}

	var ulul = $(config.ul);

	if (config.emptyContainer !== false) {
		ulul.empty();
	}

	ulul.append(config.template(data));

	try {
		ulul.listview("refresh");
	} catch (e) {
	}

	if (config.postFnc != undefined) {
		config.postFnc(config, data);
	}
}
