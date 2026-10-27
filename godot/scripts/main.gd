extends Node3D

const Data = preload("res://scripts/game_data.gd")
const Simulation = preload("res://scripts/simulation.gd")
const SaveStore = preload("res://scripts/save_store.gd")
const Sound = preload("res://scripts/sound.gd")
const Atmosphere = preload("res://scripts/atmosphere.gd")
const TYPES = ["gun", "sniper", "mortar", "slow", "skyguard", "amp"]

var save_store = SaveStore.new()
var sound: Node
var sim: RefCounted
var world: Node3D
var camera: Camera3D
var ui: Control
var canvas: CanvasLayer
var menu: Control
var dialog_layer: Control
var navigation: VBoxContainer
var dock: PanelContainer
var speed_bar: HBoxContainer
var wave_label: Label
var coins_label: Label
var health_label: Label
var tower_panel: PanelContainer
var tower_title: Label
var tower_stars: Label
var tower_stats: Label
var upgrade_button: Button
var sell_button: Button
var audio_button: Button
var speed_slider: HSlider
var speed_value: Label
var _pause_menu_open = false
var _return_to_pause = false
var shop_buttons: Dictionary = {}
var selected: Dictionary = {}
var hovered: Dictionary = {}
var building = ""
var ghost: Node3D
var range_mesh: MeshInstance3D
var spot_nodes: Array = []
var tower_nodes: Dictionary = {}
var enemy_nodes: Dictionary = {}
var projectile_nodes: Array = []
var deaths: Array = []
var effects: Array = []
var _models: Dictionary = {}
var _gesture_start = Vector2.ZERO
var _gesture_time = 0
var _gesture_moved = false
var _touches: Dictionary = {}
var _multitouch = false
var _dialog_pause = false
var _active_dialog: Control
var accent = Color("c99d62")
var panel_color = Color("181410")
var muted = Color("b9aa95")
var _last_time = 0.0
var _screenshot_path = ""
var _screenshot_timer = 0.0

func _ready() -> void:
	get_window().mode = Window.MODE_FULLSCREEN
	get_tree().auto_accept_quit = false
	sound = Sound.new()
	add_child(sound)
	sound.enabled = save_store.data.audio_enabled
	canvas = CanvasLayer.new()
	add_child(canvas)
	ui = Control.new()
	ui.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	ui.mouse_filter = Control.MOUSE_FILTER_IGNORE
	canvas.add_child(ui)
	dialog_layer = Control.new()
	dialog_layer.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	dialog_layer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	ui.add_child(dialog_layer)
	get_viewport().size_changed.connect(_layout)
	for arg in OS.get_cmdline_user_args():
		if arg == "--windowed":
			get_window().mode = Window.MODE_WINDOWED
			DisplayServer.window_set_size(Vector2i(1440, 900))
	show_menu()
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--map="):
			start_game(arg.trim_prefix("--map="), "easy")
		elif arg.begins_with("--screenshot="):
			_screenshot_path = arg.trim_prefix("--screenshot=")
			_screenshot_timer = 3.0
		elif arg == "--demo":
			call_deferred("_demo")

func _demo() -> void:
	if sim == null:
		start_game("hell", "easy")
	sim.coins = 3000
	for i in range(min(8, sim.spots.size())):
		sim.build("sniper" if sim.spots[i].restricted_to != "" else TYPES[i % 6] if TYPES[i % 6] != "sniper" else "gun", i)
	if not sim.towers.is_empty():
		select_tower(sim.towers[int(sim.towers.size() / 2)])
	sim.start_wave()

func _style(background: Color, border: Color, padding: int = 8) -> StyleBoxFlat:
	var box = StyleBoxFlat.new()
	box.bg_color = background
	box.border_color = border
	box.set_border_width_all(1)
	box.set_corner_radius_all(4)
	box.content_margin_left = padding
	box.content_margin_right = padding
	box.content_margin_top = padding
	box.content_margin_bottom = padding
	return box

func _theme() -> Theme:
	var theme = Theme.new()
	theme.default_font_size = 14
	theme.default_font = preload("res://assets/fonts/Interface.ttf")
	theme.set_color("font_color", "Label", Color("e8e1d3") if accent.r > accent.b else Color("d4e6ed"))
	theme.set_color("font_color", "Button", muted)
	theme.set_color("font_hover_color", "Button", accent)
	theme.set_color("font_pressed_color", "Button", accent)
	theme.set_stylebox("normal", "Button", _style(panel_color.lightened(0.04), Color(accent, 0.28), 8))
	theme.set_stylebox("hover", "Button", _style(panel_color.lightened(0.10), accent, 8))
	theme.set_stylebox("pressed", "Button", _style(panel_color.lightened(0.16), accent, 8))
	theme.set_stylebox("disabled", "Button", _style(panel_color, Color(accent, 0.12), 8))
	theme.set_stylebox("panel", "PanelContainer", _style(Color(panel_color, 0.96), Color(accent, 0.45), 10))
	return theme

func _button(text: String, callback: Callable, parent: Node, minimum: Vector2 = Vector2(0, 40)) -> Button:
	var button = Button.new()
	button.text = text
	button.custom_minimum_size = minimum
	button.pressed.connect(callback)
	parent.add_child(button)
	return button

func _label(text: String, parent: Node, font_size: int = 14) -> Label:
	var label = Label.new()
	label.text = text
	label.add_theme_font_size_override("font_size", font_size)
	parent.add_child(label)
	return label

func _remove_game_ui() -> void:
	for child in ui.get_children():
		if child != dialog_layer:
			ui.remove_child(child)
			child.queue_free()
	shop_buttons.clear()
	speed_slider = null
	speed_value = null
	tower_panel = null

func show_menu() -> void:
	_close_dialog()
	_return_to_pause = false
	if world != null:
		world.queue_free()
		world = null
	if camera != null:
		camera.queue_free()
		camera = null
	sim = null
	selected = {}
	hovered = {}
	building = ""
	tower_nodes.clear()
	enemy_nodes.clear()
	deaths.clear()
	effects.clear()
	projectile_nodes.clear()
	spot_nodes.clear()
	_remove_game_ui()
	accent = Color("88ccff")
	panel_color = Color("0b1729")
	muted = Color("bbd6e8")
	ui.theme = _theme()
	menu = Control.new()
	menu.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	ui.add_child(menu)
	_menu_backdrop(menu)
	var box = PanelContainer.new()
	box.name = "MenuBox"
	box.add_theme_stylebox_override("panel", _style(Color(0.025, 0.045, 0.075, 0.65), Color(0.72, 0.80, 0.85, 0.15), 28))
	menu.add_child(box)
	var rows = VBoxContainer.new()
	rows.add_theme_constant_override("separation", 14)
	box.add_child(rows)
	_menu_contents(rows, false)
	_layout()
	ui.move_child(dialog_layer, ui.get_child_count() - 1)
	call_deferred("_layout")

func _menu_backdrop(parent: Control) -> void:
	var image = TextureRect.new()
	image.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	image.texture = load("res://assets/winter_watch.png")
	image.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	image.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	image.mouse_filter = Control.MOUSE_FILTER_IGNORE
	parent.add_child(image)
	parent.move_child(image, 0)
	var snow = CPUParticles2D.new()
	snow.name = "MenuSnow"
	snow.amount = 100
	snow.lifetime = 18.0
	snow.preprocess = 10.0
	snow.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	snow.emission_rect_extents = Vector2(900, 50)
	snow.position = Vector2(720, -40)
	snow.direction = Vector2(0.15, 1)
	snow.spread = 15
	snow.gravity = Vector2.ZERO
	snow.initial_velocity_min = 25
	snow.initial_velocity_max = 65
	snow.scale_amount_min = 0.6
	snow.scale_amount_max = 1.8
	snow.color = Color(0.8, 0.9, 1, 0.4)
	parent.add_child(snow)
	parent.move_child(snow, 1)

func _menu_contents(rows: VBoxContainer, paused: bool) -> void:
	var caption = _label("ПОСЛЕДНИЙ БАСТИОН  /  ЗИМНЯЯ СТРАЖА", rows, 11)
	caption.modulate = Color("b6c4cf")
	var title = _label("ЗАЩИТНИК", rows, 35)
	title.add_theme_font_override("font", preload("res://assets/fonts/Title.ttf"))
	title.modulate = Color("f1e5d1")
	var subtitle = _label("Пока горит огонь — надежда жива.", rows, 12)
	subtitle.modulate = Color("b6c4cf")
	_label("ИГРА ПРИОСТАНОВЛЕНА" if paused else "", rows, 10).modulate = Color("dfb878")
	_button("Продолжить" if paused else "Начать защиту", _close_dialog if paused else func(): _choose_difficulty(save_store.data.selected_map), rows, Vector2(355, 52))
	_button("Выбрать карту", func(): _open_menu_dialog(_show_maps, paused), rows, Vector2(355, 46))
	_button("Как играть", func(): _open_menu_dialog(_show_rules, paused), rows, Vector2(355, 46))
	var audio = _button("Звук: " + ("включён" if sound.enabled else "выключен"), func(): _toggle_audio(), rows, Vector2(355, 46))
	audio.pressed.connect(func(): audio.text = "Звук: " + ("включён" if sound.enabled else "выключен"))
	if paused:
		_button("В главное меню", func(): _open_menu_dialog(_confirm_exit, true), rows, Vector2(355, 46))
	_button("Выйти из игры", _quit_game, rows, Vector2(355, 46))
	_label("ESC — ВЕРНУТЬСЯ К ЗАЩИТЕ" if paused else "ОДИНОКИЙ СТРАЖ · ЗИМНИЕ СУМЕРКИ", rows, 10).modulate = Color("8b9da8")

func _open_menu_dialog(callback: Callable, from_pause: bool) -> void:
	callback.call()
	_return_to_pause = from_pause

func _show_pause_menu() -> void:
	if sim == null:
		return
	_return_to_pause = false
	var rows = _dialog("", 435)
	rows.get_child(0).queue_free()
	_menu_backdrop(_active_dialog)
	_menu_contents(rows, true)
	_pause_menu_open = true
	if is_instance_valid(world):
		world.hide()

func _back_dialog() -> void:
	if _return_to_pause:
		_return_to_pause = false
		_show_pause_menu()
	else:
		_close_dialog()

func _dialog(title: String, width: float = 600.0) -> VBoxContainer:
	_close_dialog()
	if sim != null:
		_dialog_pause = sim.paused
		sim.paused = true
	_active_dialog = ColorRect.new()
	_active_dialog.color = Color(0.01, 0.02, 0.04, 0.9)
	_active_dialog.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	dialog_layer.add_child(_active_dialog)
	var center = CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_active_dialog.add_child(center)
	var panel = PanelContainer.new()
	panel.custom_minimum_size.x = width
	center.add_child(panel)
	var rows = VBoxContainer.new()
	rows.add_theme_constant_override("separation", 12)
	panel.add_child(rows)
	var label = _label(title, rows, 26)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	return rows

func _close_dialog() -> void:
	_pause_menu_open = false
	if is_instance_valid(world):
		world.show()
	if _active_dialog != null:
		_active_dialog.queue_free()
		_active_dialog = null
		if sim != null:
			sim.paused = _dialog_pause

func _show_maps() -> void:
	var rows = _dialog("ВЫБОР КАРТЫ", 650)
	for id in ["hell", "ice"]:
		var data = Data.all().maps[id]
		var best = save_store.data.best_waves.get(id, 0)
		var stars = int(save_store.data.stars.get(id, 0))
		var text = data.name + "\n" + ("Ад" if id == "hell" else "Лёд") + " · 20 волн · Рекорд: %s · %s" % [best, "★".repeat(stars)]
		_button(text, func(): save_store.data.selected_map = id; save_store.save(); _choose_difficulty(id), rows, Vector2(600, 90))
	_button("Назад", _back_dialog, rows)

func _choose_difficulty(id: String) -> void:
	var rows = _dialog("СЛОЖНОСТЬ · " + Data.all().maps[id].name, 640)
	for key in ["easy", "medium", "hard"]:
		var data = Data.all().difficulty[key]
		var text = "%s\nЗдоровье: %d · Монеты: %d" % [data.name, data.hp, data.coins]
		_button(text, func(): start_game(id, key), rows, Vector2(590, 76))
	_button("Назад", _back_dialog, rows)

func _show_rules() -> void:
	var rows = _dialog("ПРАВИЛА", 760)
	var scroll = ScrollContainer.new()
	scroll.custom_minimum_size = Vector2(710, 430)
	rows.add_child(scroll)
	var content = VBoxContainer.new()
	content.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(content)
	var intro = _label("Отбейте 20 волн. Враги, дошедшие до крепости, отнимают здоровье.\nВыберите башню внизу и свободную площадку на карте.\nСнайпер строится только на специальных синих площадках.\nEsc — меню паузы · Ползунок ТЕМП — от 0.25× до 5×.\nПодготовка следующей волны начинается автоматически.", content, 15)
	intro.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	for type in TYPES:
		var data = Data.all().towers[type]
		_label("\n%s · %d монет" % [data.name, data.baseCost], content, 19)
		var label = _label(data.details, content, 14)
		label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		for level in [2, 3]:
			var stats = Data.stats(type, level)
			_label("%d уровень: %s · дальность %.1f · урон %.1f" % [level, data.upgrades[str(level)], stats.range, stats.damage], content, 12)
	_button("Понятно", _back_dialog, rows)

func start_game(id: String, difficulty_id: String) -> void:
	_close_dialog()
	_return_to_pause = false
	if world != null:
		world.queue_free()
	if camera != null:
		camera.queue_free()
	_remove_game_ui()
	tower_nodes.clear()
	enemy_nodes.clear()
	spot_nodes.clear()
	projectile_nodes.clear()
	deaths.clear()
	effects.clear()
	selected = {}
	hovered = {}
	building = ""
	ghost = null
	range_mesh = null
	save_store.data.selected_map = id
	save_store.data.difficulty[id] = difficulty_id
	save_store.save()
	sim = Simulation.new()
	sim.setup(id, difficulty_id)
	_last_time = 0.0
	sim.tower_changed.connect(_tower_changed)
	sim.enemy_spawned.connect(_enemy_spawned)
	sim.enemy_removed.connect(_enemy_removed)
	sim.effect.connect(_effect)
	sim.changed.connect(_refresh)
	sim.wave_started.connect(func(): sound.wave_start())
	sim.completed.connect(_completed)
	accent = Color("c99d62") if id == "hell" else Color("99c3d2")
	panel_color = Color("181410") if id == "hell" else Color("10212b")
	muted = Color("b9aa95") if id == "hell" else Color("a6c0ca")
	ui.theme = _theme()
	world = Node3D.new()
	add_child(world)
	world.add_child(_model("world_" + id))
	_lighting(id)
	camera = Camera3D.new()
	camera.fov = 45.0
	camera.far = 1600.0
	add_child(camera)
	camera.current = true
	for i in range(sim.spots.size()):
		var spot = sim.spots[i]
		var mesh = _mesh(CylinderMesh.new(), Color("a4c5d5") if spot.restricted_to != "" else accent, true)
		mesh.mesh.top_radius = 1.12
		mesh.mesh.bottom_radius = 1.18
		mesh.mesh.height = 0.10
		mesh.mesh.radial_segments = 16
		mesh.position = spot.position + Vector3.UP * 0.27
		mesh.visible = false
		world.add_child(mesh)
		spot_nodes.append(mesh)
	_build_hud()
	_refresh()
	_layout()
	call_deferred("_layout")
	ui.move_child(dialog_layer, ui.get_child_count() - 1)

func _model(key: String) -> Node3D:
	if not _models.has(key):
		_models[key] = load("res://assets/models/" + key + ".glb")
	var result = _models[key].instantiate()
	_prepare_materials(result)
	return result

func _prepare_materials(node: Node) -> void:
	if node is MeshInstance3D and node.name.begins_with("billboard"):
		for i in range(node.mesh.get_surface_count()):
			var material = node.get_active_material(i)
			if material is StandardMaterial3D:
				material = material.duplicate()
				material.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
				material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
				material.no_depth_test = false
				node.set_surface_override_material(i, material)
	for child in node.get_children():
		_prepare_materials(child)

func _mesh(mesh: Mesh, color: Color, unshaded: bool = false) -> MeshInstance3D:
	var instance = MeshInstance3D.new()
	instance.mesh = mesh
	var material = StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = 0.8
	if unshaded:
		material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	instance.material_override = material
	return instance

func _lighting(id: String) -> void:
	Atmosphere.setup(world, id)

func _build_hud() -> void:
	navigation = VBoxContainer.new()
	ui.add_child(navigation)
	_label(sim.map.name.to_upper(), navigation, 11).modulate = muted
	var nav_panel = PanelContainer.new()
	navigation.add_child(nav_panel)
	var nav = HBoxContainer.new()
	nav_panel.add_child(nav)
	_button("Меню · Esc", _show_pause_menu, nav)
	_button("Карты", _show_maps, nav)
	_button("Правила", _show_rules, nav)
	_button("Сложность", func(): _choose_difficulty(sim.map_id), nav)
	speed_bar = HBoxContainer.new()
	ui.add_child(speed_bar)
	var tempo = VBoxContainer.new()
	tempo.add_theme_constant_override("separation", 3)
	speed_bar.add_child(tempo)
	speed_value = _label("ТЕМП  ·  1.00×", tempo, 11)
	speed_value.modulate = muted
	speed_slider = HSlider.new()
	speed_slider.custom_minimum_size = Vector2(220, 30)
	speed_slider.min_value = 0.25
	speed_slider.max_value = 5.0
	speed_slider.step = 0.05
	speed_slider.value = 1.0
	speed_slider.tooltip_text = "Темп боя · 0.25× — 5× · Двойной щелчок: обычная скорость"
	speed_slider.value_changed.connect(func(value): sim.speed = value; _refresh())
	speed_slider.gui_input.connect(func(event):
		if event is InputEventMouseButton and event.double_click:
			speed_slider.value = 1.0)
	tempo.add_child(speed_slider)
	audio_button = null
	wave_label = _label("", ui, 15)
	dock = PanelContainer.new()
	ui.add_child(dock)
	var shop = HBoxContainer.new()
	shop.add_theme_constant_override("separation", 5)
	dock.add_child(shop)
	var balance = VBoxContainer.new()
	balance.custom_minimum_size.x = 100
	shop.add_child(balance)
	_label("КАЗНА", balance, 10).modulate = muted
	coins_label = _label("", balance, 24)
	coins_label.modulate = accent
	for type in TYPES:
		var data = Data.all().towers[type]
		var text = "%s\n%d" % [data.name, data.baseCost]
		var button = _button(text, func(): enter_build(type), shop, Vector2(116, 64))
		_shop_icon(type, button)
		button.add_theme_font_size_override("font_size", 12)
		button.tooltip_text = data.role + "\n" + data.details
		shop_buttons[type] = button
	health_label = _label("", ui, 24)
	health_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	tower_panel = PanelContainer.new()
	tower_panel.custom_minimum_size.x = 234
	ui.add_child(tower_panel)
	var rows = VBoxContainer.new()
	tower_panel.add_child(rows)
	var header = HBoxContainer.new()
	rows.add_child(header)
	var titles = VBoxContainer.new()
	titles.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(titles)
	tower_title = _label("", titles, 15)
	tower_stars = _label("", titles, 12)
	tower_stars.modulate = accent
	_button("×", deselect, header, Vector2(44, 44))
	tower_stats = _label("", rows, 13)
	var actions = HBoxContainer.new()
	rows.add_child(actions)
	upgrade_button = _button("", _upgrade, actions, Vector2(104, 44))
	upgrade_button.add_theme_font_size_override("font_size", 12)
	sell_button = _button("", _sell, actions, Vector2(104, 44))
	sell_button.add_theme_font_size_override("font_size", 12)
	tower_panel.hide()

func _confirm_exit() -> void:
	var rows = _dialog("Выйти в меню?", 500)
	_label("Текущий прогресс забега будет потерян.", rows)
	_button("Остаться", _back_dialog, rows)
	_button("Выйти", show_menu, rows)

func _toggle_audio() -> void:
	sound.set_enabled(not sound.enabled)
	save_store.data.audio_enabled = sound.enabled
	save_store.save()
	_refresh()

func _refresh() -> void:
	if sim == null or coins_label == null:
		return
	coins_label.text = str(sim.coins)
	wave_label.text = "ВОЛНА  %d / 20" % sim.wave
	health_label.text = str(sim.hp)
	health_label.modulate = Color("f3897e") if sim.hp < sim.max_hp * 0.3 else Color("f0eee4")
	if is_instance_valid(speed_value):
		speed_value.text = "ТЕМП  ·  %.2f×" % sim.speed
	if is_instance_valid(speed_slider):
		speed_slider.set_value_no_signal(sim.speed)
	for type in shop_buttons:
		shop_buttons[type].disabled = sim.coins < Data.all().towers[type].baseCost
		shop_buttons[type].modulate = accent if building == type else Color.WHITE
	if not selected.is_empty() and selected.alive:
		var data = Data.all().towers[selected.type]
		var stats = selected.stats
		tower_title.text = data.name
		tower_stars.text = "★".repeat(selected.level) + "☆".repeat(3 - selected.level)
		var text = ""
		if stats.damage > 0:
			text += "Урон: %d\nСкорость: %.2f/сек\n" % [round(stats.damage), stats.fireRate]
		text += "Дальность: %.1f м" % stats.range
		if stats.get("slowPercent", 0) > 0:
			text += "\nЗамедление: −%d%%" % stats.slowPercent
		if stats.get("buffPercent", 0) > 0:
			text += "\nУсиление: +%d%%" % stats.buffPercent
		tower_stats.text = text
		var cost = Data.upgrade_cost(selected.type, selected.level)
		upgrade_button.text = "Макс.\nуровень" if cost < 0 else "Улучшить\n· %d" % cost
		upgrade_button.disabled = cost < 0 or sim.coins < cost
		sell_button.text = "Продать\n· +%d" % Data.sell_price(selected.type, selected.level)
		tower_panel.show()
	else:
		tower_panel.hide()

func _layout() -> void:
	var view = get_viewport().get_visible_rect().size
	if sim == null:
		if is_instance_valid(menu):
			var box = menu.get_node_or_null("MenuBox")
			if box != null:
				box.position = Vector2(view.x * 0.075, maxf(24, (view.y - box.get_combined_minimum_size().y) * 0.5))
		return
	navigation.position = Vector2(18, 14)
	speed_bar.position = Vector2(view.x - speed_bar.get_combined_minimum_size().x - 18, 32)
	wave_label.position = Vector2((view.x - 150) * 0.5, 44)
	dock.position = Vector2((view.x - dock.get_combined_minimum_size().x) * 0.5, view.y - dock.get_combined_minimum_size().y - 14)
	_fit_camera()
	_position_tower_panel()

func _fit_camera() -> void:
	if camera == null or sim == null:
		return
	var view = get_viewport().get_visible_rect().size
	var top = navigation.position.y + navigation.get_combined_minimum_size().y + 10
	var bottom = view.y - dock.position.y + 18
	var usable = max(view.y * 0.35, view.y - top - bottom)
	var tangent = tan(deg_to_rad(45.0) / 2.0)
	var tilt = deg_to_rad(50.0)
	var forward = Vector3(0, -cos(tilt), -sin(tilt))
	var up = Vector3(0, sin(tilt), -cos(tilt))
	var corners: Array[Vector3] = []
	for x in [-55.0, 55.0]:
		for z in [-15.0, 15.0]:
			for y in [0.0, 2.0]:
				corners.append(Vector3(x, y, z))
	for point in sim.waypoints:
		corners.append(point + Vector3.UP * 2.0)
	for spot in sim.spots:
		corners.append(spot.position + Vector3.UP * 2.0)
	corners.append(sim.waypoints[0] + Vector3.UP * 18)
	corners.append(sim.waypoints[-1] + Vector3.UP * 18)
	var distance = 20.0
	for point in corners:
		var depth = point.dot(forward)
		distance = max(distance, abs(point.x) / (tangent * view.x / view.y) - depth)
		distance = max(distance, abs(point.dot(up)) / (tangent * usable / view.y) - depth)
	distance /= 0.98
	camera.position = -forward * distance
	camera.look_at(Vector3.ZERO, Vector3.UP)
	camera.v_offset = (top - bottom) / view.y * distance * tangent

func _position_tower_panel() -> void:
	if sim == null or camera == null:
		return
	var base = camera.unproject_position(sim.waypoints[-1] + Vector3.UP * 17)
	health_label.position = base - Vector2(health_label.size.x / 2, health_label.size.y)
	if selected.is_empty() or not selected.alive or not tower_panel.visible:
		return
	var point = camera.unproject_position(selected.position + Vector3.UP * 2)
	var size = tower_panel.get_combined_minimum_size()
	var viewport = get_viewport().get_visible_rect().size
	var top = navigation.position.y + navigation.get_combined_minimum_size().y + 8
	var bottom = dock.position.y - 8
	var best = Vector2.ZERO
	var score = INF
	for candidate in [point + Vector2(24, -size.y / 2), point - Vector2(size.x + 24, size.y / 2), point - Vector2(size.x / 2, size.y + 24), point + Vector2(-size.x / 2, 24)]:
		var pos = Vector2(clampf(candidate.x, 8, viewport.x - size.x - 8), clampf(candidate.y, top, bottom - size.y))
		var distance = Vector2(maxf(maxf(pos.x - point.x, 0), point.x - pos.x - size.x), maxf(maxf(pos.y - point.y, 0), point.y - pos.y - size.y))
		var current = distance.length() + (10000 if distance.x < 18 and distance.y < 18 else 0)
		if current < score:
			score = current
			best = pos
	tower_panel.position = best

func enter_build(type: String) -> void:
	if sim == null or sim.coins < Data.all().towers[type].baseCost:
		return
	if building == type:
		cancel_build()
		return
	cancel_build()
	deselect()
	building = type
	ghost = _model("tower_%s_1" % type)
	world.add_child(ghost)
	_transparency(ghost, 0.55)
	ghost.hide()
	for i in range(spot_nodes.size()):
		var spot = sim.spots[i]
		var valid = _spot_allows(i, type)
		spot_nodes[i].visible = valid
		spot_nodes[i].material_override.albedo_color = Color("44ff66")
	_refresh()

func cancel_build() -> void:
	building = ""
	if is_instance_valid(ghost):
		ghost.queue_free()
	ghost = null
	for i in range(spot_nodes.size()):
		spot_nodes[i].hide()
		spot_nodes[i].material_override.albedo_color = Color("a4c5d5") if sim.spots[i].restricted_to != "" else accent
	_update_range()
	_refresh()

func select_tower(tower: Dictionary) -> void:
	selected = tower
	_update_range()
	_refresh()
	call_deferred("_position_tower_panel")

func deselect() -> void:
	selected = {}
	_update_range()
	_refresh()

func _upgrade() -> void:
	if not selected.is_empty():
		sim.upgrade(selected)
		_update_range()

func _sell() -> void:
	if not selected.is_empty():
		sim.sell(selected)
		deselect()

func _tower_changed(tower: Dictionary, action: String) -> void:
	if tower_nodes.has(tower.id):
		tower_nodes[tower.id].queue_free()
		tower_nodes.erase(tower.id)
	if action != "sell":
		var node = _model("tower_%s_%d" % [tower.type, tower.level])
		node.position = tower.position
		world.add_child(node)
		tower_nodes[tower.id] = node
	spot_nodes[tower.spot].visible = building != "" and _spot_allows(tower.spot, building)

func _enemy_spawned(enemy: Dictionary) -> void:
	var node = _model("enemy_" + enemy.type)
	world.add_child(node)
	var bar = Node3D.new()
	world.add_child(bar)
	var background = _mesh(QuadMesh.new(), Color("160f18"), true)
	background.mesh.size = Vector2(2.0, 0.15)
	bar.add_child(background)
	var fill = _mesh(QuadMesh.new(), Color("a9da77"), true)
	fill.mesh.size = Vector2(2.0, 0.13)
	fill.position.z = 0.01
	bar.add_child(fill)
	enemy_nodes[enemy.id] = {"node": node, "bar": bar, "fill": fill, "joints": node.find_children("motion_*", "Node3D", true, false)}
	var data = sim.map.enemies[enemy.type]
	sound.growl(data.get("isBoss", false))

func _enemy_removed(enemy: Dictionary, rewarded: bool) -> void:
	if not enemy_nodes.has(enemy.id):
		return
	var entry = enemy_nodes[enemy.id]
	entry.bar.queue_free()
	deaths.append({"node": entry.node, "time": 0.0, "start_y": float(entry.node.position.y), "target_y": max(0.08, sim.map.enemies[enemy.type].size * 0.15), "angle": entry.node.rotation.z, "direction": -1.0 if randf() < 0.5 else 1.0})
	enemy_nodes.erase(enemy.id)
	if rewarded:
		sound.death()
		_coin_burst(enemy.position + Vector3.UP * enemy.base_y, 28 if sim.map.enemies[enemy.type].get("isBoss", false) else randi_range(3, 5))

func _transparency(node: Node, value: float) -> void:
	if node is GeometryInstance3D:
		node.transparency = clampf(value, 0.0, 1.0)
	for child in node.get_children():
		_transparency(child, value)

func _spot_allows(index: int, type: String) -> bool:
	var spot = sim.spots[index]
	return spot.tower == null and ((spot.restricted_to == "" and type != "sniper") or spot.restricted_to == type)

func _floor_point(screen: Vector2):
	return Plane(Vector3.UP, 0).intersects_ray(camera.project_ray_origin(screen), camera.project_ray_normal(screen))

func _tower_at(screen: Vector2) -> Dictionary:
	var best: Dictionary = {}
	var distance = 24.0
	for tower in sim.towers:
		var point = camera.unproject_position(tower.position + Vector3.UP * 2.0)
		var current = screen.distance_to(point)
		if current < distance:
			distance = current
			best = tower
	return best

func _spot_at(screen: Vector2) -> int:
	var floor_point = _floor_point(screen)
	if floor_point == null:
		return -1
	var best = -1
	var distance = 6.0
	for i in range(sim.spots.size()):
		if not _spot_allows(i, building):
			continue
		var current = sim.spots[i].position.distance_to(floor_point)
		if current < distance:
			distance = current
			best = i
	return best

func _canvas_click(screen: Vector2) -> void:
	if building != "":
		var spot = _spot_at(screen)
		if spot >= 0:
			var built = sim.build(building, spot)
			if not built.is_empty():
				cancel_build()
				select_tower(built)
				return
	var tower = _tower_at(screen)
	if not tower.is_empty():
		cancel_build()
		select_tower(tower)
		return
	if building != "":
		cancel_build()
	deselect()

func _pointer_move(screen: Vector2) -> void:
	if building != "" and is_instance_valid(ghost):
		var index = _spot_at(screen)
		ghost.visible = index >= 0
		if index >= 0:
			ghost.position = sim.spots[index].position
			_draw_range(ghost.position, Data.stats(building, 1).range, Color("64d8b1"))
		else:
			_hide_range()
		return
	var tower = _tower_at(screen)
	if tower != hovered:
		hovered = tower
		_update_range()

func _unhandled_input(event: InputEvent) -> void:
	if sim == null or _active_dialog != null:
		return
	if event is InputEventMouseMotion:
		if event.position.distance_to(_gesture_start) > 20:
			_gesture_moved = true
		_pointer_move(event.position)
	elif event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		if event.pressed:
			_gesture_start = event.position
			_gesture_moved = false
		else:
			if not _gesture_moved and event.position.distance_to(_gesture_start) <= 20:
				_canvas_click(event.position)
	elif event is InputEventScreenTouch:
		if event.pressed:
			_touches[event.index] = event.position
			if _touches.size() > 1:
				_multitouch = true
			else:
				_multitouch = false
				_gesture_start = event.position
				_gesture_time = Time.get_ticks_msec()
				_gesture_moved = false
		else:
			_touches.erase(event.index)
			if not event.canceled and not _multitouch and not _gesture_moved and Time.get_ticks_msec() - _gesture_time < 500 and event.position.distance_to(_gesture_start) <= 20:
				_canvas_click(event.position)
	elif event is InputEventScreenDrag:
		if event.position.distance_to(_gesture_start) > 20:
			_gesture_moved = true
		_pointer_move(event.position)

func _unhandled_key_input(event: InputEvent) -> void:
	if not event is InputEventKey or not event.pressed or event.echo:
		return
	if event.keycode == KEY_ESCAPE:
		if _active_dialog != null:
			_back_dialog()
		elif sim != null:
			_show_pause_menu()
		return

func _hide_range() -> void:
	if is_instance_valid(range_mesh):
		range_mesh.queue_free()
	range_mesh = null

func _update_range() -> void:
	if sim == null:
		return
	var tower = selected if not selected.is_empty() else hovered
	if building == "" and not tower.is_empty() and tower.alive:
		_draw_range(tower.position, tower.stats.range, Color("66a4cc"))
	elif building == "":
		_hide_range()

func _draw_range(position: Vector3, radius: float, color: Color) -> void:
	_hide_range()
	var mesh = ImmediateMesh.new()
	mesh.surface_begin(Mesh.PRIMITIVE_LINE_STRIP)
	for i in range(97):
		var angle = float(i) / 96.0 * TAU
		mesh.surface_add_vertex(Vector3(cos(angle) * radius, 0.15, sin(angle) * radius))
	mesh.surface_end()
	range_mesh = _mesh(mesh, color, true)
	range_mesh.material_override.no_depth_test = true
	range_mesh.position = position
	world.add_child(range_mesh)

func _beam(start: Vector3, end: Vector3, color: Color, duration: float = 0.15) -> void:
	if start.distance_to(end) < 0.01:
		return
	var mesh = CylinderMesh.new()
	mesh.top_radius = 0.07
	mesh.bottom_radius = 0.07
	mesh.height = start.distance_to(end)
	mesh.radial_segments = 5
	var beam = _mesh(mesh, color, true)
	beam.position = (start + end) * 0.5
	beam.quaternion = Quaternion(Vector3.UP, (end - start).normalized())
	world.add_child(beam)
	effects.append({"node": beam, "time": duration, "duration": duration, "kind": "beam"})

func _effect(event: Dictionary) -> void:
	match event.kind:
		"base_damage":
			sound.scream()
		"bullet", "mortar":
			sound.shoot()
			var mesh = SphereMesh.new()
			mesh.radius = 0.22 if event.kind == "mortar" else 0.09
			mesh.height = mesh.radius * 2
			mesh.radial_segments = 6
			mesh.rings = 3
			var node = _mesh(mesh, event.color, true)
			world.add_child(node)
			projectile_nodes.append({"node": node, "state": event})
		"beam":
			sound.shoot()
			_beam(event.start, event.end, event.color)
		"karma":
			_beam(event.position, event.position + Vector3.UP * 7.0, Color("fff0a0"), 0.35)
		"explosion", "lava", "ring":
			var mesh: Mesh
			var duration = float(event.get("duration", 0.4))
			var color = event.get("color", Color("ff6a24"))
			if event.kind == "explosion":
				var sphere = SphereMesh.new()
				sphere.radius = 0.5
				sphere.height = 1.0
				sphere.radial_segments = 8
				sphere.rings = 4
				mesh = sphere
			else:
				var cylinder = CylinderMesh.new()
				cylinder.top_radius = event.get("radius", 1.0)
				cylinder.bottom_radius = cylinder.top_radius
				cylinder.height = 0.04
				cylinder.radial_segments = 32
				mesh = cylinder
			var node = _mesh(mesh, color, true)
			node.position = event.position + Vector3.UP * 0.15
			world.add_child(node)
			effects.append({"node": node, "time": duration, "duration": duration, "kind": event.kind})

func _coin_burst(position: Vector3, count: int) -> void:
	for i in range(count):
		var mesh = CylinderMesh.new()
		mesh.top_radius = 0.317
		mesh.bottom_radius = 0.317
		mesh.height = 0.086
		mesh.radial_segments = 8
		var node = _mesh(mesh, Color("ffd166"))
		node.position = position
		node.rotation.x = PI * 0.5
		world.add_child(node)
		var angle = randf() * TAU
		effects.append({"node": node, "time": 1.0, "duration": 1.0, "kind": "coin", "velocity": Vector3(cos(angle) * randf_range(1.8, 4.3), randf_range(3.5, 6.0), sin(angle) * randf_range(1.8, 4.3))})

func _completed(won: bool) -> void:
	save_store.record(sim.map_id, sim.wave, sim.hp, sim.kills, won)
	var rows = _dialog("ПОБЕДА!" if won else "ПОРАЖЕНИЕ", 540)
	if won:
		_label("★".repeat(3 if sim.hp >= 20 else (2 if sim.hp >= 10 else 1)), rows, 36)
	_label("Волны: %d / 20 · Убийств: %d · Здоровье: %d" % [sim.wave, sim.kills, sim.hp], rows)
	_button("Ещё раз", func(): start_game(sim.map_id, sim.difficulty.key), rows)
	_button("Выбрать карту", _show_maps, rows)
	_button("Главное меню", show_menu, rows)

func _physics_process(delta: float) -> void:
	if sim != null and _active_dialog == null:
		sim.tick(min(delta, 0.1))

func _process(delta: float) -> void:
	if sim != null and camera != null:
		var game_delta = max(0.0, sim.game_time - _last_time)
		_last_time = sim.game_time
		for enemy in sim.enemies:
			if not enemy_nodes.has(enemy.id):
				continue
			var entry = enemy_nodes[enemy.id]
			var data = sim.map.enemies[enemy.type]
			var phase = enemy.walk_phase
			for joint in entry.joints:
				var sign = -1.0 if str(joint.name).ends_with("L") or str(joint.name).contains("-1") else 1.0
				if str(joint.name).contains("leg"):
					joint.rotation.x = sin(phase) * 0.32 * sign
				elif str(joint.name).contains("arm"):
					joint.rotation.x = -sin(phase) * 0.20 * sign
				elif str(joint.name).contains("wing"):
					joint.rotation.z = sin(phase) * 0.32 * sign
				elif str(joint.name).contains("head"):
					joint.rotation.y = sin(phase * 0.35) * 0.06
				elif str(joint.name).contains("torso"):
					joint.scale.y = 1.0 + sin(phase * 0.5) * 0.012
			entry.node.position = enemy.position + Vector3.UP * (enemy.base_y + (sin(phase) if data.flying else abs(sin(phase))) * data.walk.bobAmp * data.size)
			var direction = sim.waypoints[enemy.path_index + 1] - sim.waypoints[enemy.path_index]
			entry.node.rotation = Vector3(cos(phase * 2) * data.walk.get("leanAmp", 0.02), atan2(direction.x, direction.z), sin(phase) * data.walk.swayAmp * data.size)
			var body_height = 1.9 if enemy.type == "hound" else 1.75 if "ballista" in enemy.type else 3.4
			entry.bar.position = enemy.position + Vector3.UP * (body_height * data.size + 0.45 + (enemy.base_y - data.size * 0.35 if data.flying else 0.0))
			entry.bar.quaternion = camera.quaternion
			var ratio = clampf(enemy.hp / enemy.max_hp, 0.001, 1.0)
			entry.fill.scale.x = ratio
			entry.fill.position.x = -(1.0 - ratio)
		for tower in sim.towers:
			if not tower_nodes.has(tower.id):
				continue
			var turret = tower_nodes[tower.id].find_child("turret", true, false)
			if turret != null and tower.has("target") and not tower.target.is_empty() and tower.target.alive:
				turret.rotation.y = tower.angle
			if turret != null and tower.type == "amp":
				turret.rotation.y += game_delta * 1.5
		for entry in projectile_nodes.duplicate():
			if sim.projectiles.has(entry.state):
				entry.node.position = entry.state.position
			else:
				entry.node.queue_free()
				projectile_nodes.erase(entry)
		for death in deaths.duplicate():
			death.time += game_delta
			var t = death.time
			if t >= 11.1:
				death.node.queue_free()
				deaths.erase(death)
				continue
			var eased = 1.0 - pow(1.0 - min(1.0, t / 0.6), 3)
			death.node.position.y = lerpf(death.start_y, death.target_y, eased)
			death.node.rotation.z = death.angle + PI * 0.5 * death.direction * eased
			if t > 9.6:
				_transparency(death.node, (t - 9.6) / 1.5)
		for effect in effects.duplicate():
			effect.time -= game_delta
			if effect.time <= 0:
				effect.node.queue_free()
				effects.erase(effect)
				continue
			if effect.kind == "coin":
				effect.node.position += effect.velocity * game_delta
				effect.velocity.y -= 12.0 * game_delta
				effect.node.position.y = max(0.18, effect.node.position.y)
			elif effect.kind == "explosion":
				effect.node.scale += Vector3.ONE * game_delta * 4.0
			_transparency(effect.node, 1.0 - effect.time / effect.duration)
		_position_tower_panel()
		if Engine.get_process_frames() < 8:
			_layout()
	if _screenshot_path != "":
		_screenshot_timer -= delta
		if _screenshot_timer <= 0:
			var destination = _screenshot_path
			_screenshot_path = ""
			await RenderingServer.frame_post_draw
			get_viewport().get_texture().get_image().save_png(destination)
			_quit_game()

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_CLOSE_REQUEST:
		_quit_game()

func _quit_game() -> void:
	if sound != null:
		sound.set_enabled(false)
	await get_tree().process_frame
	await get_tree().process_frame
	get_tree().quit()

func _shop_icon(type: String, button: Button) -> void:
	button.text = ""
	var row = HBoxContainer.new()
	row.position = Vector2(4, 6)
	row.mouse_filter = Control.MOUSE_FILTER_IGNORE
	button.add_child(row)
	var container = SubViewportContainer.new()
	container.custom_minimum_size = Vector2(30, 48)
	container.stretch = true
	container.mouse_filter = Control.MOUSE_FILTER_IGNORE
	row.add_child(container)
	var viewport = SubViewport.new()
	viewport.size = Vector2i(60, 96)
	viewport.transparent_bg = true
	viewport.own_world_3d = true
	viewport.render_target_update_mode = SubViewport.UPDATE_ONCE
	container.add_child(viewport)
	var model = _model("tower_%s_1" % type)
	viewport.add_child(model)
	var icon_camera = Camera3D.new()
	icon_camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	icon_camera.size = 5.8
	icon_camera.position = Vector3(5, 5, 7)
	viewport.add_child(icon_camera)
	icon_camera.look_at(Vector3(0, 1.6, 0))
	var light = DirectionalLight3D.new()
	light.rotation_degrees = Vector3(-45, -35, 0)
	light.light_energy = 1.8
	viewport.add_child(light)
	var environment = WorldEnvironment.new()
	var settings = Environment.new()
	settings.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	settings.ambient_light_color = Color.WHITE
	settings.ambient_light_energy = 0.8
	environment.environment = settings
	viewport.add_child(environment)
	var labels = VBoxContainer.new()
	labels.mouse_filter = Control.MOUSE_FILTER_IGNORE
	row.add_child(labels)
	var data = Data.all().towers[type]
	var name_label = _label(data.name.replace("Небесный страж", "Небесный\nстраж"), labels, 10)
	name_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var cost = _label(str(int(data.baseCost)), labels, 13)
	cost.mouse_filter = Control.MOUSE_FILTER_IGNORE
	cost.modulate = accent
