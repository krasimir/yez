chrome.extension.onMessage.addListener(function(command, sender, sendResponse) {
    switch(command.type) {
    	case "click":
    		var elements = document.querySelectorAll(command.data);
    		if(elements && elements.length > 0) {
    			elements[0].click();
    			sendResponse('Element clicked. There ' + (elements.length == 1 ? 'is one element' : elements.length + ' elements') + ' matching "' + command.data + '" selector.');
    		} else {
    			sendResponse('There are no elements matching "' + command.data + '" selector.');
    		}
    	break;
    }
    return true;
});