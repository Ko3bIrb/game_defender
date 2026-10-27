extends Node

var enabled = true
var _players: Array[AudioStreamPlayer] = []
var _files = {"roar": preload("res://assets/audio/the_monster_roar.mp3"), "exit": preload("res://assets/audio/the_monsters_exit.mp3"), "scream": preload("res://assets/audio/scream.mp3")}
var _last_shoot = -10000
var _last_death = -10000
var _last_roar = -10000
var _last_scream = -10000
var _shot: AudioStreamWAV
var _death: AudioStreamWAV

func _ready() -> void:
	_shot = _tone(0.05)
	_death = _tone(0.10)
	for i in range(12):
		var player = AudioStreamPlayer.new()
		add_child(player)
		_players.append(player)

func _tone(volume: float) -> AudioStreamWAV:
	var stream = AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = 22050
	var bytes = PackedByteArray()
	var phase = 0.0
	for i in range(int(22050 * 0.07)):
		var t = float(i) / 22050.0
		phase += TAU * 320.0 * pow(0.65, min(t / 0.055, 1.0)) / 22050.0
		var gain = volume * t / 0.004 if t < 0.004 else volume * pow(0.0001 / volume, (t - 0.004) / 0.056)
		var sample = int(sin(phase) * gain * 32767.0)
		bytes.append(sample & 255)
		bytes.append((sample >> 8) & 255)
	stream.data = bytes
	return stream

func _play(stream: AudioStream, volume: float, pitch: float = 1.0) -> void:
	if not enabled:
		return
	for player in _players:
		if not player.playing:
			player.stream = stream
			player.volume_db = linear_to_db(max(0.0001, volume))
			player.pitch_scale = pitch
			player.play()
			return

func shoot() -> void:
	var now = Time.get_ticks_msec()
	if now - _last_shoot >= 150:
		_last_shoot = now
		_play(_shot, 1.0, randf_range(0.9, 1.1))

func death() -> void:
	var now = Time.get_ticks_msec()
	if now - _last_death >= 100:
		_last_death = now
		_play(_death, 1.0)

func wave_start() -> void:
	_play(_files.exit, 0.3)

func growl(boss: bool = false) -> void:
	var now = Time.get_ticks_msec()
	if boss or now - _last_roar >= 6000:
		_last_roar = now
		_play(_files.roar, 0.42 if boss else 0.12, 0.75 if boss else 0.92)

func scream() -> void:
	var now = Time.get_ticks_msec()
	if now - _last_scream >= 2000:
		_last_scream = now
		_play(_files.scream, 0.24)

func set_enabled(value: bool) -> void:
	enabled = value
	if not value:
		for player in _players:
			player.stop()

func _exit_tree() -> void:
	for player in _players:
		player.stop()
		player.stream = null
	_players.clear()
