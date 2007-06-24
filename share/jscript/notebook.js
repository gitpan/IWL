// vim: set autoindent shiftwidth=4 tabstop=8:
/**
 * @class Notebook is a class for creating notebook tab containers
 * @extends Widget
 * */
var Notebook = {};
Object.extend(Object.extend(Notebook, Widget), {
    /**
     * Selects the given tab
     * @param tab The tab to select
     * @returns The object
     * */
    selectTab: function(tab) {
	tab = $(tab);
	if (!tab) return;
	tab.setSelected(true);
	return this;
    },
    /**
     * Removes the given tab
     * @param tab The tab to remove 
     * @returns The object
     * */
    removeTab: function(tab) {
	tab = $(tab) || this.currentTab;
	if (!tab) return;
	tab.remove();
	return this;
    },
    /**
     * Appends a new tab
     * @param {String} text The text for the tab label
     * @param data The data to add to the tab page. Can be HTML or IWL json format
     * @param {Boolean} selected True if the tab should be selected
     * @returns The created tab
     * */
    appendTab: function(text, data, selected) {
	var tab = this.__createTab(text, data);
	this.tabContainer.appendChild(tab);
	this.pageContainer.appendChild(tab.page);
	tab.setSelected(selected);
	return tab;
    },
    /**
     * Prepends a new tab
     * @param {String} text The text for the tab label
     * @param data The data to add to the tab page. Can be HTML or IWL json format
     * @param {Boolean} selected True if the tab should be selected
     * @returns The created tab
     * */
    prependTab: function(text, data, selected) {
	var tab = this.__createTab(text, data);
	this.tabContainer.insertBefore(tab, this.tabContainer.firstChild);
	this.pageContainer.insertBefore(tab.page, this.pageContainer.firstChild);
	tab.setSelected(selected);
	return tab;
    },

    _init: function (id) {
	this.tabContainer = this.down(null, 1);
	this.pageContainer = this.down().next(null, 1);

	this.tabs = [];
	this.currentTab = this.tabContainer.getElementsByClassName(
		$A(this.classNames()).first() + '_tab_selected')[0];

	var pages = this.pageContainer.childElements().select(function($_) {
	    return $_.hasClassName('notebook_page')
	});

	this.tabContainer.childElements().each(function($_, $i) {
	    if ($_.hasClassName('notebook_tab'))
		this.tabs.push(Tab.create($_, this, pages[$i]));
	}.bind(this));
    },

    __createTab: function(text, data) {
	var tab = Builder.node('li', {
	    'class': $A(this.classNames()).first() + '_tab',
	    id: this.id + '_tab_' + this.tabs.length
	});
	
	var page = Builder.node('div', {
	    'class': $A(this.classNames()).first() + '_page',
	    id: this.id + '_page_' + this.tabs.length
	});
	page.style.display = 'none';

	var anchor = Builder.node('a', text);
	tab.appendChild(anchor);
	Tab.create(tab, this, page);
	this.tabs.push(tab);
	if (typeof data === 'string')
	    page.update(data);
	else if (typeof data === 'object')
	    createHtmlElement(data, page);
	return tab;
    }
});

/**
 * @class Tab is a class for creating notebook tabs
 * @extends Widget
 * */
var Tab = {};
Object.extend(Object.extend(Tab, Widget), {
    /**
     * Sets whether the tab is selected
     * @param {Boolean} select True if the tab should be selected
     * @returns The object 
     * */
    setSelected: function(select) {
	var base_class = $A(this.notebook.classNames()).first();
	if (select) {
	    if (this.isSelected()) return;
	    if (this.notebook.currentTab)
		this.notebook.currentTab.setSelected(false, true);

	    this.addClassName(base_class + '_tab_selected');
	    this.page.addClassName(base_class + '_page_selected');
	    this.page.show();
	    this.notebook.currentTab = this;
	    if (!arguments[1]) {
		var anchor = this.down();
		if (anchor && anchor.onclick) anchor.onclick();
	    }

	    this.notebook.emitSignal('current_tab_change', this);
	    this.emitSignal('select');
	} else {
	    if (!this.isSelected() || this.notebook.tabs.length == 1) return;
	    this.removeClassName(base_class + '_tab_selected');
	    this.page.removeClassName(base_class + '_page_selected');
	    this.page.hide();
	    this.notebook.currentTab = null;

	    if (!arguments[1]) {
		var prev = this.prevTab() || this.nextTab();
		if (prev) prev.setSelected(true);
	    }
	    this.emitSignal('unselect');
	}
	return this;
    },
    /**
     * Checks whether the tab is selected
     * @returns True if the tab is selected
     * @type Boolean
     * */
    isSelected: function() {
	return this.hasClassName($A(this.classNames()).first() + '_selected');
    },
    /**
     * Removes the tab 
     * @returns The object 
     * */
    remove: function() {
	this.setSelected(false);
	this.parentNode.removeChild(this);
	this.page.parentNode.removeChild(this.page);
	this.notebook.tabs = this.notebook.tabs.without(this);
	this.emitSignal('remove');
    },
    /**
     * @returns The previous tab
     * */
    prevTab: function() {
	return this.notebook.tabs[this.notebook.tabs.indexOf(this) - 1];
    },
    /**
     * @returns The next tab 
     * */
    nextTab: function() {
	return this.notebook.tabs[this.notebook.tabs.indexOf(this) + 1];
    },
    /**
     * Sets the tab label
     * @param {String} text The label text
     * @returns The object
     * */
    setLabel: function(text) {
	var anchor = this.down();
	if (!text) text = '&nbsp;';
	if (anchor) anchor.update(text);
	return this;
    },
    /**
     * @returns The tab label
     * @type String
     * */
    getLabel: function() {
	var anchor = this.down();
	if (anchor) return anchor.getText();
    },
    
    _init: function(id, notebook, page) {
	this.notebook = notebook;
	this.page = page;
	this.__initEvents();
    },
    __initEvents: function() {
	this.observe('click', function() {
	    this.setSelected(true, true);
	}.bind(this));
    }
});
