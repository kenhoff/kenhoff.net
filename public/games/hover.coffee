console.log "asdfasdf"
$(document).ready ->
	$ ".flexbox-child"
		.hover ( ->
			$(".flexbox-child-hoverbox", this).addClass "hoverbox-hover"
		),
		( ->
			$(".flexbox-child-hoverbox", this).removeClass "hoverbox-hover"
		)
	
