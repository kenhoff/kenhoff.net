    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }
    

    
	function polygonArea(blob) 
	{ 
		var area = 0;
		
		for (var i = 0; i < 8; i++) { 
			area += ((blob.vertex[i].pos[0] * blob.vertex[(i + 1) % 8].pos[1]) - (blob.vertex[i].pos[1] * blob.vertex[(i + 1) % 8].pos[0]))
		}

		area = area/2;
		area = Math.abs(area);
		
		return area;
	}
