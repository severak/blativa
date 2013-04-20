gtw={
	room : '',
	
	rooms : {},
	
	items : {},
	
	cmdCode : [],
	cmdStr : [],
	
	acts : {},
	
	cmds : {},
	cmdsArity : {},
		
	nonsenseMsg : 'What?', 
	
	queue : [],
	
	stepFuns : [],

	hh : 0,
	mm : 0,
	dd : 0,
	
	spentTime : function(mins) {
		while (mins>60) {
			mins=mins-60;
			this.hh=this.hh+1;
		}
		this.mm=this.mm+mins;
		if (this.mm>59) {
			this.hh=this.hh+1;
			this.mm=this.mm-60;
		}
		if (this.hh>23) {
			this.hh=this.hh-24;
			this.dd=this.dd+1;
		}
	},

	setTime : function(hh, mm, dd) {
		this.hh=hh;
		this.mm=mm;
		this.dd = dd || this.dd;
	},
	
	init : function() {
		snack.wrap('#compass').attach('click', this.clickCompass);
		snack.wrap('#verb-menu').attach('click', this.clickVerbMenu);
		snack.wrap('#item-menu').attach('click', this.clickItemMenu);
		setInterval(gtw.checkQueue,2000);
	},
	
	act : function(cmd) {
		var verbN=cmd[0];
		var itemN=cmd[1];
		if (itemN && this.items[itemN]) {
			var item=this.items[itemN];
			this.write('> '+this.cmdStr.join(' '));
			var cbk = item[verbN] || this.nonsenseMsg;
			if (typeof cbk=='function') {
				cbk.apply(this)
			} else if(typeof cbk=='string') {
				this.write(cbk);
			}
		}
		this.step();
		this.spentTime(1);
		this.refreshItemMenu();
	},
	
	cls : function() {
		document.getElementById('text').innerHTML = '';
	},
	
	clickCompass : function(e) {
		snack.preventDefault(e);
		var src = e.target || e.srcElement || e.originalTarget;
		var dir = src.getAttribute('id');
		var room = gtw.rooms[ gtw.room ]
		if (room[dir]) {
			gtw.write('> '+src.innerText);
			gtw.enterRoom(room[dir]);
			gtw.spentTime(5);
		}
	},
	
	clickVerbMenu : function(e) {
		snack.preventDefault(e);
		snack.wrap('.menu a').removeClass('selected');
		var src=e.target || e.srcElement || e.originalTarget;
		snack.wrap(src).addClass('selected');
		id=src.getAttribute('data-ident');
		gtw.cmdCode = [id];
		gtw.cmdStr = [ gtw.cmds[id] ];
		var arity = gtw.cmdsArity[id] || 2;
		if (arity==1) {
			gtw.acts[id]();
		}
	},
	
	clickItemMenu : function(e) {
		snack.preventDefault(e);
		var src=e.target || e.srcElement || e.originalTarget;
		snack.wrap('.menu a').removeClass('selected');
		id=src.getAttribute('data-ident');
		gtw.cmdCode.push(id);
		gtw.cmdStr.push(src.innerText)
		gtw.act(gtw.cmdCode);
	},
	
	write : function(text) {
		var par=document.createElement('p');
		par.innerHTML=text;
		document.getElementById('text').appendChild(par);
		par.scrollIntoView();
	},
	
	setMenu : function(id, menu) {
		var el=document.getElementById(id);
		el.innerHTML='';
		snack.each(menu, function(v, k) {
			var li=document.createElement('li');
			li.innerHTML = ['<a href="#" data-ident="', k ,'">', v , '</a>'].join('');
			el.appendChild(li);
		});
	},
	
	setCommands : function(cmds) {
		this.cmds=cmds;
		this.setMenu('verb-menu', cmds);
	},
	
	enterRoom : function(id) {
		this.room = id;
		var room = this.rooms[id]
		this.write(room.name);
		this.write(room.desc);
		snack.each(['n','s','w','e','nw','ne','sw','se','up','down','in','out'], function(k){
			var wrap = snack.wrap('#'+k);
			if (room[k]) {
				wrap.removeClass('disabled');
			} else {
				wrap.addClass('disabled');
			}
		});
		this.step();
		this.refreshItemMenu();
	},
	
	refreshItemMenu : function() {
		var items={};
		var roomItems=this.itemsInRoom(this.room);
		snack.each(roomItems ,function(k) {
			items[k]=gtw.items[k].name
		});
		var inventory=this.itemsInRoom('inventory');
		snack.each(inventory ,function(k) {
			items[k]=gtw.items[k].name
		});
		this.setMenu('item-menu', items);
	},
	
	pick : function(list) {
		return list[Math.floor(Math.random()*list.length)];
	},
	
	picker : function(list) {
		return function() {
			this.write(gtw.pick(list));
		}
	},
	
	checkQueue : function() {
		if (gtw.queue.length>0) {
			var first=gtw.queue.shift();
			if (typeof first=='string') {
				gtw.write(first);
			}
		}
	},
	
	nop : function(){},
	
	itemsInRoom : function(name) {
		var ret = [];
		for (k in this.items) {
			if ( (this.items[k].w || null) ==name ) {
				ret.push(k);
			}
		}
		return ret;
	},
	
	later : function(data) {
		this.queue.push(data);
	},
	
	step : function() {
		var stepFun=this.rooms[ this.room ].step || this.nop;
		stepFun.apply(this);
		for (i=0; i < this.stepFuns.length; i++) {
			this.stepFuns[i].apply(this);
		}
	},
	
	takeable : function() {
		var item = this.items[ this.cmdCode[1] ];
		if (item.w=='inventory') {
			this.write('Už máš '+item.name);
		} else if (item.w==this.room) {
			item.w = 'inventory';
			this.write('OK. Beru si '+item.name);
		}
	},
	
	dropable : function() {
		var item = this.items[ this.cmdCode[1] ];
		if (item.w=='inventory') {
			item.w = this.room;
			this.write('OK. Odkládám tu '+item.name);
		} else if (item) {
			this.write('Nemůžu položit '+item.name+', nemám to!');
		}
	}
	
	
}