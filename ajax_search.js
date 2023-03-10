// search

var sort = "";
var sortColumn = "Title";
var url = "";
var extra = "";
var dir = 1; // 1 = Ascending, 0 = Descending
var inner = document.getElementById("inner");
var searchResults = document.getElementById("searchResults");
var loading = document.getElementById("loading");
var actionStack = [];

var types = new Array("Petition", "Calendar");
var modes = new Array("Search");
var checks = new Array("All", "Title", "Text", "Majority", "Minority"/*, "Submitter"*/);

for (var i in types) {
	for (var j in modes) {
		for (var k in checks) {
			var id = types[i] + '_' + modes[j] + '_Include_' + checks[k];
			var checkBox = document.getElementById(id);
			//alert(id);
			if (checkBox != null) {
				checkBox.onclick = includeCheckClicked;
			}
		}
	}
}
/*
var petitionAllCheck = document.getElementById("Petition_Search_All_Check");
petitionAllCheck.onclick = allChecked;
*/
var petitionWindow = null;
var disciplineWindow = null;
var resolutionWindow = null;
var majorityWindow = null;
var minorityWindow = null;

function includeCheckClicked() {
	var parts = this.id.split('_');
	var type = parts[0];
	var mode = parts[1];
	var check = parts[3];
	
	var allCheck = document.getElementById(type + '_' + mode + '_Include_All');
	var titleCheck = document.getElementById(type + '_' + mode + '_Include_Title');
	var textCheck = document.getElementById(type + '_' + mode + '_Include_Text');
	//var submitterCheck = document.getElementById(type + '_' + mode + '_Include_Submitter');
	var majorityCheck = document.getElementById(type + '_' + mode + '_Include_Majority');
	var minorityCheck = document.getElementById(type + '_' + mode + '_Include_Minority');
	
	if (check == 'All') {
		if (!allCheck.checked) {
			titleCheck.checked = false;
			if (type == 'Petition') {
				textCheck.checked = false;
			}
			//submitterCheck.checked = false;
			if (type == 'Calendar') {
				majorityCheck.checked = false;
				minorityCheck.checked = false;
			}
		} else {
			titleCheck.checked = true;
			if (type == 'Petition') {
				textCheck.checked = true;
			}
			//submitterCheck.checked = true;
			if (type == 'Calendar') {
				majorityCheck.checked = true;
				minorityCheck.checked = true;
			}
		}
	} else {
		var cond = false;
		if (type == 'Petition') {
			cond = (titleCheck.checked && textCheck.checked);
		} else if (type == 'Calendar') {
			cond = (titleCheck.checked && majorityCheck.checked && minorityCheck.checked);
		}
		if (cond) {
			allCheck.checked = true;
		} else {
			if (allCheck.checked) {
				allCheck.checked = false;
			}
		}
	}
}

types = new Array("Petition", "Calendar");
modes = new Array("Search");
checks = new Array("Submitter", "Committee");
for (var i in types) {
	for (var j in modes) {
		for (var k in checks) {
			var id = types[i] + '_' + modes[j] + '_Narrow_' + checks[k];
			var checkBox = document.getElementById(id);
			//alert(id);
			if (checkBox != null) {
				checkBox.onclick = narrowCheckClicked;
			}
		}
	}
}

function narrowCheckClicked() {
	var thisDiv = document.getElementById(this.id + '_Div');
	if (this.checked) {
		thisDiv.style.display = 'block';
	} else {
		thisDiv.style.display = 'none';
	}
}

function addPetition() {
	var list = document.getElementById('petitionsList');
	//alert(list[list.selectedIndex].value);
	
	var table = document.getElementById('subscriptionChanges');
	var value = list[list.selectedIndex].value;
	var text = list[list.selectedIndex].text;
	text = text.replace(value + ' ', '');
	var row = '<tr class="firstColor"><td><b>' + value + '</b></td><td>' + text + '</td><td><a style="cursor: pointer; background: none;">Cancel Changes</a><img src="/images/delete.png" style="border: none; margin-left: -6px; margin-bottom: -4px;" /></td></tr>';
	table.innerHTML += row;
	list.remove(list.selectedIndex);
}

var g_emailId;
function trackingRequest(id, emailId) {
        var httpRequest;
        g_emailId = emailId;

        if (window.XMLHttpRequest) { // Mozilla, Safari, ...
            httpRequest = new XMLHttpRequest();
            if (httpRequest.overrideMimeType) {
                httpRequest.overrideMimeType('text/xml');
                // See note below about this line
            }
        } 
        else if (window.ActiveXObject) { // IE
            try {
                httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
                } 
                catch (e) {
                           try {
                                httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
                               } 
                             catch (e) {}
                          }
                                       }

        if (!httpRequest) {
            alert('Giving up :( Cannot create an XMLHTTP instance');
            return false;
        }
        
        var petitionElement = document.getElementById(id);
        var parts = id.split('_');
        var url = 'http://calms.umc.org/2008/Subscription.aspx?number=' + parts[1] + '&emailId=' + emailId + '&tracking=' + petitionElement.getAttribute('tracking');
        httpRequest.onreadystatechange = function() { trackingResponse(httpRequest); };
        httpRequest.open('GET', url, true);
        httpRequest.send('');
		petitionElement.innerHTML = '<img src="/images/ajax-loader.gif" /> Updating...';
    }

function trackingResponse(httpRequest) {
	if (httpRequest.readyState == 4) {
		if (httpRequest.status == 200) {
			
            var number = httpRequest.responseText;
            var id = 'Petition_' + number + '_Action';
            var petitionElement = document.getElementById(id);
            if (petitionElement.getAttribute('tracking') == 'yes') {
				petitionElement.setAttribute('tracking', 'no');
				petitionElement.innerHTML = '<a onClick="trackingRequest(\'' + id + '\', \'' + g_emailId + '\')" style="cursor: pointer; background: none;">Start Tracking</a><img src="/images/add.png" style="border: none; margin-left: -6px; margin-bottom: -4px;" />';
            } else {
				petitionElement.setAttribute('tracking', 'yes');
				petitionElement.innerHTML = '<a onClick="trackingRequest(\'' + id + '\', \'' + g_emailId + '\')" style="cursor: pointer; background: none;">Stop Tracking</a><img src="/images/delete.png" style="border: none; margin-left: -6px; margin-bottom: -4px;" />';
            }
        }
    }
}

/*
function allChecked()
{
	var parts = this.id.split('_');
	if (parts[0] == 'Petition') {
		var petitionAllCheck = document.getElementById("Petition_Search_All_Check");
		var petitionTitleCheck = document.getElementById("Petition_Search_Title_Check");
		var petitionTextCheck = document.getElementById("Petition_Search_Text_Check");
		var petitionSubmitterCheck = document.getElementById("Petition_Search_Submitter_Check");
		if (petitionAllCheck.checked) {
			petitionTitleCheck.checked = true;
			petitionTextCheck.checked = true;
			petitionSubmitterCheck.checked = true;
			
			petitionTitleCheck.disabled = true;
			petitionTextCheck.disabled = true;
			petitionSubmitterCheck.disabled = true;
		} else {
			petitionTitleCheck.checked = false;
			petitionTextCheck.checked = false;
			petitionSubmitterCheck.checked = false;
			
			petitionTitleCheck.disabled = false;
			petitionTextCheck.disabled = false;
			petitionSubmitterCheck.disabled = false;
		}
	}
	
}
*/

var bookBrowseTypeRadios = document.getElementsByName('bookBrowseType');
for (var i = 0; i < bookBrowseTypeRadios.length; i++) {
	bookBrowseTypeRadios[i].onclick = bookBrowseType_changed;
}

function bookBrowseType_changed() {
	function toggleBookInclude(on) {
		var enabledColor = '#333333';
		var disabledColor = '#CCCCCC';
		var color = (on) ? enabledColor : disabledColor;
		var radios = document.getElementsByName('include');
		var textAll = document.getElementById('BookIncludeText_All');
		var textExisting = document.getElementById('BookIncludeText_Existing');
		var textNew = document.getElementById('BookIncludeText_New');
		for (var i = 0; i < radios.length; i++) {
			radios[i].disabled = !on;
			textAll.style.color = color;
			textExisting.style.color = color;
			textNew.style.color = color;
		}
	}
	
	var radios = document.getElementsByName('bookBrowseType');
	for (var i = 0; i < radios.length; i++) {
		if (radios[i].checked) {
			if (radios[i].value == 'NonDis') {
				toggleBookInclude(false);
				break;
			} else {
				toggleBookInclude(true);
				break;
			}
		}
	}
}

function showKeyword(id) {
	//alert(this.id);
	var parts = id.split('_');
	var type = parts[0];
	var mode = parts[1];
	var check = document.getElementById(id);
	var style = (check.checked) ? 'inline' : 'none';
	var nid = type + '_Submitter_Keyword_Row';
	//alert(nid);
	var row = document.getElementById(nid);
	row.style.display = style;
}

function bookChange(id, index) {
    var tab;
    var parts = new Array();
    
    parts = id.split('_');
    tab = parts[0];
    
    var disciplineSelect = document.getElementById(tab + '_Discipline_Select');
    var resolutionSelect = document.getElementById(tab + '_Resolution_Select');
    if (index == 0) {
        // Discipline
        disciplineSelect.style.display = "inline";
        resolutionSelect.style.display = "none";
    } else {
        // Resolution
        disciplineSelect.style.display = "none";
        resolutionSelect.style.display = "inline";
    }
}

function popup(mode, number) {
	var url = 'Text.aspx@mode=' + mode + '&Number=' + number + ".html";
	
	if (mode == 'Petition') {
		if (petitionWindow != null) {
			petitionWindow.close();
		}
		petitionWindow = window.open(url, '_blank', 'menubar=no, width=600, height=600, toolbar=no, scrollbars=yes, resizable=yes');
	} else if (mode == 'Discipline' || mode == 'DisciplineEdited') {
		if (disciplineWindow != null) {
			disciplineWindow.close();
		}
		disciplineWindow = window.open(url, '_blank', 'menubar=no, width=600, height=600, toolbar=no, scrollbars=yes, resizable=yes');
	} else if (mode == 'Resolution' || mode == 'ResolutionEdited') {
		if (resolutionWindow != null) {
			resolutionWindow.close();
		}
		resolutionWindow = window.open(url, '_blank', 'menubar=no, width=600, height=600, toolbar=no, scrollbars=yes, resizable=yes');
	} else if (mode == 'Majority') {
		if (majorityWindow != null) {
			majorityWindow.close();
		}
		majorityWindow = window.open(url, '_blank', 'menubar=no, width=600, height=600, toolbar=no, scrollbars=yes, resizable=yes');
	} else if (mode == 'Minority') {
		if (minorityWindow != null) {
			minorityWindow.close();
		}
		minorityWindow = window.open(url, '_blank', 'menubar=no, width=600, height=600, toolbar=no, scrollbars=yes, resizable=yes');
	}
}

function IsNumeric(sText)

{
   var ValidChars = "0123456789.";
   var IsNumber=true;
   var Char;

 
   for (i = 0; i < sText.length && IsNumber == true; i++) 
      { 
      Char = sText.charAt(i); 
      if (ValidChars.indexOf(Char) == -1) 
         {
         IsNumber = false;
         }
      }
   return IsNumber;
   
   }
   
function validate() {
	var numberText = document.getElementById("Petition_Single_Text");
	number = numberText.value;
	
	if (!IsNumeric(number)) {
		alert('Please enter only numbers (digits 0-9).');
		return false;
	}
	
	if (! ((number >= 1 && number <= 1564) || (number >= 80001 && number <= 81564)) ) {
		alert('Please enter a number between 80001 and 81564');
		return false;
	}
	
	return true;
}

/*
function doSearch(buttonId) {
	var sortDirection = (dir == 1) ? "&dir=Asc" : "&dir=Desc";
	if (buttonId == '') {
		makeRequest(url + sort + sortDirection, alertContents);
		return;
	}
    
    var params = getParams(buttonId);
    if (params.mode == 'Single') {
		if (!validate()) {
			return false;
		}
	}
	
	var inner = document.getElementById("inner");
	var searchResults = document.getElementById("searchResults");
	var loading = document.getElementById("loading");
	var heading = document.getElementById("mainHeading");
	
    inner.style.display = 'none';
    searchResults.style.display = 'none';
    loading.style.display = 'block';
    
    heading.innerHTML = 'Petition Search Results';
    
    var special = getSpecialParams(params);
    
    url = 'http://calms.umc.org/2008/Search.aspx?';
    var count = 0;
    for (var i in params) {
		if (count == 0) {
			url += i + '=' + params[i];
		} else {
			url += '&' + i + '=' + params[i];
		}
		count++;
	}
	for (var j in special) {
		url += '&' + j + '=' + special[j];
	}
    
    window.location = '#';
    var loc = url + sort + sortDirection;
    actionStack.push(loc);
    //alert("adding url: " + loc);
    makeRequest(loc, alertContents);
}
*/

String.prototype.trim = function () {
  return this.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
};

function doSearch(searchType) {

	var parts = searchType.split('_');
	var type = parts[0];
	var mode = parts[1];
	if (mode == 'Book') {
		var select = document.getElementById(type + '_' + mode + '_Select');
		var book = select.value;
		var select = document.getElementById(type + '_' + book + '_Select');
		var bookMode = document.getElementById(type + '_' + mode + '_Mode');
		bookMode.value = book;
		var number = document.getElementById(type + '_' + mode + '_Number');
		number.value = select.value;
	} else if (mode == 'Search') {
	    var searchText = document.getElementById(type + '_' + mode + '_Text').value;
	    searchText = searchText.trim();
	    if (searchText == "") {
	        alert('Search keyword field cannot be empty. Please enter a keyword or try a different search function.');
	        return false;
	    }
		var titleCheck = document.getElementById(type + '_' + mode + '_Include_Title');
		var searchMask = document.getElementById(type + '_' + mode + '_Mask');
		mask = 0;
		mask += (titleCheck.checked) ? 1 : 0;
		
		if (type == 'Petition') {
			var textCheck = document.getElementById(type + '_' + mode + '_Include_Text');
			var submitterCheck = document.getElementById(type + '_' + mode + '_Narrow_Submitter');
			var committeeCheck = document.getElementById(type + '_' + mode + '_Narrow_Committee');
		
			mask += (textCheck.checked) ? 2 : 0;
			mask += (submitterCheck.checked) ? 4 : 0;
			mask += (committeeCheck.checked) ? 8 : 0;
		} else if (type == 'Calendar') {
			var majorityCheck = document.getElementById(type + '_' + mode + '_Include_Majority');
			var minorityCheck = document.getElementById(type + '_' + mode + '_Include_Minority');
		
			mask += (majorityCheck.checked) ? 2 : 0;
			mask += (minorityCheck.checked) ? 4 : 0;
		}
		
		searchMask.value = mask;
	}
}

function doSpecificSearch(type, mode, params) {
	var inner = document.getElementById("inner");
	var searchResults = document.getElementById("searchResults");
	var loading = document.getElementById("loading");
	var heading = document.getElementById("mainHeading");
	
    inner.style.display = 'none';
    searchResults.style.display = 'none';
    loading.style.display = 'block';
    heading.innerHTML = 'Petition Search Results';
    url = 'http://calms.umc.org/2008/Search.aspx?';
    
    window.location = '#';
    var loc = url + 'type=' + type + '&mode=' + mode + params + sort;
    actionStack.push(loc);
    //alert("adding url: " + loc);
    makeRequest(loc, alertContents);
}

function getDetail(number) {
	var inner = document.getElementById("inner");
	var searchResults = document.getElementById("searchResults");
	var loading = document.getElementById("loading");
	var heading = document.getElementById("mainHeading");
	
	inner.style.display = 'none';
    searchResults.style.display = 'none';
    loading.style.display = 'block';
    
    url = 'http://calms.umc.org/2008/Search.aspx?type=Petition&mode=Single&number=' + number;
    
    window.location = '#';
    var loc = url;
    actionStack.push(loc);
    //alert("adding url: " + loc);
    makeRequest(loc, detailsReady);
}

function getParams(buttonId) {
	var params = new Object;
	var parts = new Array();
	
	parts = buttonId.split('_');
	
	params.type = parts[0];
	params.mode = parts[1];
	extra = parts[2];
	
	return params;
}

function getSpecialParams(params) {
	var specialParams = new Object;
	
	if (params.mode == 'Committee') {
		var select = document.getElementById(params.type + '_' + params.mode + '_Select');
		specialParams.cc = select.value;
	} else if (params.mode == 'Consent') {
		var select = document.getElementById(params.type + '_' + params.mode + '_Select_' + extra);
		specialParams.calendar = select.value;
	} else if (params.mode == 'Book') {
		var select = document.getElementById(params.type + '_' + params.mode + '_Select');
		specialParams.bookMode = select.value;
		var select = document.getElementById(params.type + '_' + specialParams.bookMode + '_Select');
		specialParams.number = select.value;
	} else if (params.mode == 'Search') {
		//var radios = document.getElementsByName(params.type + '_' + params.mode + '_Narrow');
		var titleCheck = document.getElementById(params.type + '_' + params.mode + '_Title_Check');
		var textCheck = document.getElementById(params.type + '_' + params.mode + '_Text_Check');
		var submitterCheck = document.getElementById(params.type + '_' + params.mode + '_Submitter_Check');
		var text = document.getElementById(params.type + '_' + params.mode + '_Text');
		var searchText = text.value;
		
		mask = 0;
		mask += (titleCheck.checked) ? 1 : 0;
		mask += (textCheck.checked) ? 2 : 0;
		mask += (submitterCheck.checked) ? 4 : 0;
		
		specialParams.searchText = searchText;
		specialParams.searchMask = mask;
	} else if (params.mode == 'Single') {
		var text = document.getElementById(params.type + '_' + params.mode + '_Text');
		var searchText = text.value;
		
		specialParams.number = searchText;
	}
	
	return specialParams;
}

function changeSort(columnId) {
	var changed = false;
	sortColumn = columnId;
	if (columnId == "Petition") {
		if (sort != "&sort=Number") {
			sort = "&sort=Number";
			changed = true;
		}
	} else if (columnId == "Title") {
		if (sort != "&sort=Title") {
			sort = "&sort=Title";
			changed = true;
		}
	} else if (columnId == "Status") {
		if (sort != "&sort=Status") {
			sort = "&sort=Status";
			changed = true;
		}
	}
	if (changed) {
		dir = 1;
		doSearch('');
	} else {
		dir = (dir == 1) ? 0 : 1;
		doSearch('');
	}
}

function showSearch() {
	var inner = document.getElementById("inner");
	var searchResults = document.getElementById("searchResults");
	var loading = document.getElementById("loading");
	var heading = document.getElementById("mainHeading");
	
    inner.style.display = 'block';
    loading.style.display = 'none';
    searchResults.style.display = 'none';
    heading.innerHTML = 'Legislation Tracking';
    
    /*
    var discipline = document.getElementById("Petition_Discipline_Select");
    discipline.selectedIndex = 0;
    discipline.style.display = 'inline';
    
    var resolution = document.getElementById("Petition_Resolution_Select");
    resolution.selectedIndex = 0;
    resolution.style.display = 'none';

    for (var i = 0; i < document.forms.length; i++) {
		document.forms[i].reset();
	}*/
}

function goBack() {
	/*
	var url = "";
	for (var i = 0; i < 2; i++) {
		if (actionStack.length == 0) {
			showSearch();
			return;
		} else {
			url = actionStack.pop();
		}
	}
	//alert("going back to: " + url);
	actionStack.push(url);
	makeRequest(url, alertContents);
	*/
	window.history.go(-1);
}

function makeRequest(url, callback) {
        var httpRequest;

        if (window.XMLHttpRequest) { // Mozilla, Safari, ...
            httpRequest = new XMLHttpRequest();
            if (httpRequest.overrideMimeType) {
                httpRequest.overrideMimeType('text/xml');
                // See note below about this line
            }
        } 
        else if (window.ActiveXObject) { // IE
            try {
                httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
                } 
                catch (e) {
                           try {
                                httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
                               } 
                             catch (e) {}
                          }
                                       }

        if (!httpRequest) {
            alert('Giving up :( Cannot create an XMLHTTP instance');
            return false;
        }
        httpRequest.onreadystatechange = function() { callback(httpRequest); };
        httpRequest.open('GET', url, true);
        httpRequest.send('');

    }

    function alertContents(httpRequest) {

        if (httpRequest.readyState == 4) {
            if (httpRequest.status == 200) {
                //alert(httpRequest.responseText);
                var html;
                var inner = document.getElementById("inner");
var searchResults = document.getElementById("searchResults");
var loading = document.getElementById("loading");
                
                loading.style.display = 'none';
                
                //html = '<a onclick="showSearch()" style="cursor: pointer;">&lt;&lt; Back to Search</a><br />';
                html = httpRequest.responseText;
                
                searchResults.innerHTML = html;
                searchResults.style.display = 'block';
                
                var column = document.getElementById(sortColumn);
                column.innerHTML += (dir == 1) ? " ▼" : " ▲▼";
                
                window.location = '#';
            } else {
                alert('There was a problem with the request.');
            }
        }

    }
    
function detailsReady(httpRequest) {
	if (httpRequest.readyState == 4) {
		if (httpRequest.status == 200) {
			var html;
            var inner = document.getElementById("inner");
			var searchResults = document.getElementById("searchResults");
			var loading = document.getElementById("loading");
                
            loading.style.display = 'none';
            
            //html = '<a onclick="showSearch()" style="cursor: pointer;">&lt;&lt; Back to Search</a><br />';
            html = httpRequest.responseText;
            
            searchResults.innerHTML = html;
            searchResults.style.display = 'block';
            
            window.location = '#';
        } else {
            alert('There was a problem with the request.');
        }
    }
}



