var kainProto = {
	// state : "idle",
	here : null,
	blocked : false,
	world : {},
	verb : null,
	cmdArgs : [],
	queue : [],
	verbsCases : {},
    verbsFallback : {},
	outputNode : null,
	verbsNode : null,
	itemsNode : null,
	dialogNode : null,
	nextClickNode : null,
		
	init : function(world) {
		this.world = world;
		this.queue = [];
		this.cmdArgs = [];
		this.verbsCases = {};
		return this;
	},
	
	setDom : function(queries) {
		this.outputNode = snack.wrap(queries.output);
		this.verbsNode = snack.wrap(queries.verbs);
		this.itemsNode = snack.wrap(queries.items);
		this.dialogNode = snack.wrap(queries.dialog);
		this.nextClickNode = snack.wrap(queries.next);
		return this;
	},
	
	bind : function(){
		this.nextClickNode.attach('click', snack.bind(this.nextLine, this) );
		this.verbsNode.attach('click', snack.bind(this.verbClick, this) );
		this.itemsNode.attach('click', snack.bind(this.itemClick, this) );
	},
	
	print : function(text) 
	{
		this._print(text);
        /*if (this.blocked) {
			this.queue.push(text);
		} else {
			this.blocked = true;
			this._print(text);
		}*/
		return this;
	},
	
	_print : function(text) {
		this.outputNode[0].innerHTML = text;
	},
	
	nextLine : function(e)
	{
		snack.preventDefault(e);
		if (this.queue.length>0) {
			var text = this.queue.shift();
			this._print(text);
		}
		if (this.queue.length==0) {
			this.nextClickNode.addClass('hidden');
			this.verbsNode.removeClass('hidden');
			this.blocked = false;
		}
	},

    _callOrEcho : function(fun) {
        if (_isType('String', fun)) {
            this.print(fun);
        } else {
            fun.call(this,[]);
        }
    },
	
	verbClick : function(e)
	{
		snack.preventDefault(e);
        snack.stopPropagation(e);
		var verb = _getHash(e);
		this.verb = verb;
		this.verbsNode.addClass('hidden');
		if (this.verbsCases[verb].length==0) {
            console.log('#1');
			var fun = this.verbsFallback[verb];
            this._callOrEcho(fun);
            this.verbsNode.removeClass('hidden');
		} else {
            console.log('#2');
			this.listReachable(this.verbsCases[verb]);
			this.itemsNode.removeClass('hidden');
			this.cmdArgs = [];
		}
        console.log('OOK');
	},
	
	itemClick : function(e)
	{
		snack.preventDefault(e);
        snack.stopPropagation(e);
		var iitem = _getHash(e);
		this.cmdArgs.push(iitem);
		console.log( iitem );
		var caseLen = this.verbsCases[this.verb].length;
		//console.log(caseLen);
		if (this.cmdArgs.length==caseLen) {
            if (this.world[this.cmdArgs[0]] && this.world[this.cmdArgs[0]][this.verb]) {
                var fun = this.world[this.cmdArgs[0]][this.verb];
            } else {
                var fun = this.verbsFallback[this.verb];
            }
            this._callOrEcho(fun);
            this.itemsNode.addClass('hidden');
            this.verbsNode.removeClass('hidden');

		} else {
			var thisCase = this.verbsCases[this.verb][this.cmdArgs.length];
			this.listReachable(thisCase);
		}
		
	},
	
	defineVerb : function(id, title, cases, fallback)
	{
		var def = '<li><a href="#' + id + '">' + title + '</a></li>';
		this.verbsNode[0].innerHTML = this.verbsNode[0].innerHTML + def;
		this.verbsCases[id] = cases || [];
        this.verbsFallback[id] = fallback || 'A?';
		return this;
	},
	
	listReachable : function(thisCase)
	{
		var buff = [];
		for (id in this.world) {
			var obj = this.world[id];
			if (obj.w=='HERO' || obj.w==this.here) {
				var name = id;
				if (obj[thisCase]) { name = obj[thisCase]; }
				buff.push('<li><a href="#' + id + '">' + id + '</a></li>');
			}
		}
		this.itemsNode[0].innerHTML = buff.join(' ');
	}
};

var _getHash = function(event) {
	var target = snack.getTarget(event);
	return target.getAttribute('href').substr(1);
};

var _isType = function(type, obj) {
    var clas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
};


if (!snack.getTarget) {
	snack.getTarget = function(e) {
		return e.target || e.srcElement || e.originalTarget;
	}
}


kainEngine = {
	pick : function(list) {
		return list[Math.floor(Math.random()*list.length)];
	},
	
	def : function(proto, exts) {
		var obj = Object.create(proto);
		for (k in exts) {
			obj[k] = exts[k];
		}
		return obj;
	},
	
	setup : function(world, dom){
		var K = Object.create(kainProto);
		K.init(world);
		K.setDom(dom);
		K.bind();
		return K;
	}

};