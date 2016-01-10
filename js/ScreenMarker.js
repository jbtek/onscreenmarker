(function(angular){
var screenModule = angular.module("ScreenMarkerControllerModule",[]);
screenModule.controller("ScreenMarkerController",function($scope,$rootElement){
	$scope.iconsrc = "";
	$scope.tooltype = "";
})
.directive("markerTools",function(){
	var markerToolsHandler = function(scope,elem,attr)
	{
		scope.selectTools = function(event){
			try{
				var currentTool = angular.element(event.currentTarget);
				console.log("currentTool::"+currentTool.attr("index"));
				var allTools = currentTool.parent().find("li");
				var parentRef = angular.element(document.querySelector(".img-cnt"))
				if(!currentTool.hasClass("active"))
				{
					scope.iconsrc = currentTool.find("img").attr("src");
					scope.tooltype = currentTool.attr("tooltype");
					console.log("scope.tooltype:::"+scope.tooltype);
					if(scope.tooltype=="texts"){		
						drawInputF.initDrawing(parentRef);
					}
					else if(scope.tooltype=="pen")
					{
						DrawLine.isPenTool = true;
						DrawLine.initDrawing(parentRef);
					}
					else
					{
						drawInputF.isMouseMove = false;
						DrawLine.isPenTool = false;
					}
					allTools.removeClass("active");
					currentTool.addClass("active");
				}
				else
				{
					drawInputF.isMouseMove = false;
					DrawLine.isPenTool = false;
					scope.iconsrc = "";
					scope.tooltype = "";
					allTools.removeClass("active");
					currentTool.removeClass("active");
				}
			}
			catch(e){
				console.log("e.mmmmm::::"+e);
			}
		}
		
	}
	
	return{
		restrict:"AEC",
		link:markerToolsHandler,
		templateUrl:"templates/tools.html"
	}
})
.directive("imageEditor",function(){
	var imageEditorHandler = function(scope,elem,attr){
		var parentRef;
		var counter=0;
		scope.isIconV = false;
		scope.toolIcon = angular.element(document.querySelector(".toolicon"));
		var notebook = angular.element(document.querySelector(".marker-place"));
		
		scope.addTools = function(event)
		{
			parentRef = angular.element(event.currentTarget).parent().parent();
			switch(scope.tooltype){
				case "cross":
				addMarker(event.clientX,event.clientY);
				notebook.css({"cursor":"default"});
				break;
				case "tick":
				addMarker(event.clientX,event.clientY);
				notebook.css({"cursor":"default"});
				break;
			}
			
		}
		
		scope.changeCursor = function(event){
			//console.log("event.type:::"+event.type);
			var currentElem = angular.element(event.currentTarget);
			if(event.type=="mouseover")
			{
				
				notebook.bind("mousemove",function(evt){
					if(scope.iconsrc=="")
					{
						drawInputF.isMouseMove = false;
						scope.isIconV = false;
						notebook.css({"cursor":"default"});
					}
					else{
						if(scope.tooltype=="texts")
						drawInputF.isMouseMove = true;
						
						var e = evt || window.event;
						scope.isIconV = true;
						scope.$digest();
						notebook.css({"cursor":"none"});
						scope.toolIcon.css({"position":"absolute","left":e.clientX+10+"px","top":e.clientY+"px"});
					}
				})
			}
			else
			{
				currentElem.css({"cursor":"default"})
				scope.isIconV = false;
				drawInputF.isMouseMove = false;
			}

		}
		
		
		function addMarker(left,top)
		{
			console.log("scope.iconsrc:::"+scope.iconsrc);
			if(scope.iconsrc!=""){
				parentRef.append('<div id="toolicon_'+counter+'"><figure><img src="'+scope.iconsrc+'"></figure></div>');
				var toolIcon = angular.element(document.getElementById("toolicon_"+counter));
				toolIcon.css({"position":"absolute","left":left+10+"px","top":top+"px"});
				counter++;
			}
		}
	}
	
	
	
	return{
		restrict:"AEC",
		link:imageEditorHandler,
		templateUrl:"templates/imgedit.html"
	}
})
.run(function($timeout){
	$timeout(function(){
		console.log("RUNNNNN"+DrawLine)
		DrawLine.drawCanvas();
	},100);
})

/*this class draw the input field on target area....*/
var drawInputF = (function(module){
	//variables...
	var mouse = {
        x: 0,
        y: 0,
        startX: 0,
        startY: 0
    };
    var element = null;
	var drag = false;
	var isDrgged = false;
	/////////////////////////////////////////////////
	module.isMouseMove = false;
	module.initDrawing = function(parentRef){
		console.log("initDrawing::::");
		try{
			function setMousePosition(e)
				{
				var ev = e || window.event; //Moz || IE
				if (ev.pageX) { //Moz
					mouse.x = ev.pageX + window.pageXOffset;
					mouse.y = ev.pageY + window.pageYOffset;
				} else if (ev.clientX) { //IE
					mouse.x = ev.clientX + document.body.scrollLeft;
					mouse.y = ev.clientY + document.body.scrollTop;
				}
			};
			
			angular.element(document).bind('mousemove',function(e){
			   setMousePosition(e);
			   if(drag){
				
				if (element !== null) {
					//console.log("mouse.x::"+mouse.x);
					isDrgged = true;
					element.style.width = Math.abs(mouse.x - mouse.startX) + 'px';
					element.style.height = Math.abs(mouse.y - mouse.startY) + 'px';
					element.style.left = (mouse.x - mouse.startX < 0) ? mouse.x + 'px' : mouse.startX + 'px';
					element.style.top = (mouse.y - mouse.startY < 0) ? mouse.y + 'px' : mouse.startY + 'px';
				}
			   }
			});
		
			parentRef.bind('mousedown',function(e){
				if(module.isMouseMove)
				{
					mouse.startX = mouse.x;
					mouse.startY = mouse.y;
					element = document.createElement('div');
					element.className = 'rectangle'
					element.style.left = mouse.x + 'px';
					element.style.top = mouse.y + 'px';
					angular.element(this).after(element);
					drag = true;
				}
			});
			
			angular.element(document).bind('mouseup',function(){
				if(!isDrgged)
				{
					if(element!==null)
					{
						angular.element(element).remove();
					}
				}
				else
				{
					if (element !== null) {
						console.log("element.style.width:::"+element.style.width);
						if(drag){
							var w = Number(element.style.width.split("px")[0])-4+'px';
							var h = Number(element.style.height.split("px")[0])-4+'px';
							angular.element(element).append("<textarea type='text'/>");
							console.log(angular.element(element).find("textarea")+":::w::"+w+"h:::"+h);
							angular.element(element).find("textarea").css({"width":w, "height":h,"resize":"none","overflow":"hidden"});
							element = null;
						}						
						console.log("finsihed.");
						isDrgged = false;
						
					}
				
				} 
				drag = false;
				module.isMouseMove = false;
			});
		}
		catch(e){
			console.log("CATCH::"+e);
		}
	}
	
	return module;
	
}(drawInputF || {}));

//This class draw or create marker tool on target area....
var DrawLine = (function(module){
	module.isPenTool = false;
	var tmp_canvas;
	var tmp_ctx;
	var mouse = {x: 0, y: 0};
	var start_mouse = {x: 0, y: 0};
	var last_mouse = {x: 0, y: 0};
	var sprayIntervalID;
	
	module.drawCanvas = function(){
			var sketch = document.querySelector('.marker-place');
			var sketch_style = window.getComputedStyle(sketch);
			
			// Creating a tmp canvas
			tmp_canvas = document.createElement('canvas');
			tmp_ctx = tmp_canvas.getContext('2d');
			tmp_canvas.id = 'tmp_canvas';
			
			tmp_canvas.width = parseInt(sketch_style.getPropertyValue('width'));
			tmp_canvas.height = parseInt(sketch_style.getPropertyValue('height'));
			sketch.appendChild(tmp_canvas);
	}
	module.initDrawing = function(parentRef)
	{
		   /* Mouse Capturing Work */
			tmp_canvas.addEventListener('mousemove', function(e) {
				mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
				mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
			}, false);
			
			/* Drawing on Paint App */
			tmp_ctx.lineWidth = 5;
			tmp_ctx.lineJoin = 'round';
			tmp_ctx.lineCap = 'round';
			tmp_ctx.strokeStyle = 'blue';
			tmp_ctx.fillStyle = 'blue';
			
			tmp_canvas.addEventListener('mousedown', function(e) {
				if(module.isPenTool){
					tmp_canvas.addEventListener('mousemove', generateSprayParticles, false);
					
					mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
					mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
					start_mouse.x = mouse.x;
					start_mouse.y = mouse.y;
					generateSprayParticles();
				}
			}, false);
			
			tmp_canvas.addEventListener('mouseup', function() {
				tmp_canvas.removeEventListener('mousemove', generateSprayParticles, false);
				// Writing down to real canvas now
				tmp_ctx.drawImage(tmp_canvas, 0, 0);
			}, false);
			
			
			var getRandomOffset = function(radius) {
				var random_angle = Math.random() * (2*Math.PI);
				var random_radius = Math.random() * radius;
				
				// console.log(random_angle, random_radius, Math.cos(random_angle), Math.sin(random_angle));
				
				return {
					x: Math.cos(random_angle) * random_radius,
					y: Math.sin(random_angle) * random_radius
				};
			};
			
			var generateSprayParticles = function() {
				// Particle count, or, density
				var density = 2000;
				for (var i = 0; i < density; i++) {
					var offset = getRandomOffset(10);
					var x = mouse.x + offset.x;
					var y = (mouse.y + offset.y)+20;
					tmp_ctx.fillRect(x, y, 1, 1);
				}
			};
	}
	
	return module;
	
}(DrawLine || {}))

}(window.angular));