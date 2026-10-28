"""Authored terrain composition for Night Watch. Routes/placements stay playable.
Static architecture is exported by Blender; repeated forest/rock props are instanced
by Godot from the scene manifest rather than duplicated into a giant world mesh.
"""
import math,random,json
from mathutils import Vector

def build_props(c):
 for i in range(3):
  random.seed(720+i);c['start']();c['fir']((0,0,0),[5.8,7.1,4.6][i],True);c['export']('prop_fir_'+str(i))
 for ice in [True,False]:
  for i in range(3):
   random.seed(460+i);c['start']();c['rock']((0,0,0),[1.0,1.5,.7][i],ice);c['export']('prop_'+('snowrock_' if ice else 'basalt_')+str(i))

def build_landscape(c,mapid):
 c['start']();c['FAST_WORLD']=True;random.seed(2109 if mapid=='ice' else 914)
 ice=mapid=='ice';data=c['DATA']['maps'][mapid];route=data['waypoints'];spots=data['spots']
 mesh,box,tube,curve,ring=c['mesh'],c['box'],c['tube'],c['curve'],c['ring']
 stone,snow,basalt,wood,bone,gold=[c[k] for k in ['STONE','SNOW','BASALT','WOOD','BONE','GOLD']]
 water=c['material']('Bay water','16485d',.28,.15,0,False)
 cascade=c['material']('Waterfall','7da5b7',.1,.22,0,False)
 magma=c['material']('Living lava','db4310',0,.65,1.2,False)
 terrainmat=c['material']('Mountain ground','71808a' if ice else '37313a',.03,.9)
 roadmat=c['material']('Old road stones','657074' if ice else '5a4e48',.02,.9)
 slate=c['material']('Wet cliff stone','3b5362' if ice else '3d3238',.13,.7)
 meta={'instances':[],'fires':[],'mist':[],'waterfall':ice,'landmarks':[]}
 if ice:
  peaks=[(-49,-62,31,22,21),(-17,-64,40,15,17),(3,-53,30,13,13),(29,-67,45,23,18),(67,-55,26,18,22),(-66,-17,14,10,17),(64,20,11,16,18)]
 else:
  peaks=[(-12,-53,34,21,22),(-47,-63,26,19,16),(26,-65,31,16,22),(58,-47,24,17,14),(-65,12,12,10,14),(62,23,13,13,17)]
 def bay(x,z):
  if ice:
   q=(x/(13.8+1.0*math.sin(z*.21)))**2+((z+19)/20.5)**2
   outlet=(x/1.8)**2+((z-10)/16)**2
   return min(q,outlet)
  return ((x+3)/13.2)**2+((z-3)/11.5)**2
 def river_distance(x,z):
  center=(-4+2.0*math.sin(z*.15)) if not ice else .4*math.sin(z*.3)
  return abs(x-center)
 def height(x,z):
  h=-.4+.6*math.sin(x*.105+math.sin(z*.08))+.45*math.cos(z*.13+x*.045)
  for px,pz,hh,rx,rz in peaks:
   q=((x-px)/rx)**2+((z-pz)/rz)**2
   ridge=1+.05*math.sin(x*.43+z*.19)+.03*math.sin(z*.58-x*.27)
   h+=hh*math.exp(-q*1.7)*ridge
  if not ice:
   crater=((x+12)/6)**2+((z+53)/5.5)**2
   h-=9*math.exp(-crater*2)
  q=bay(x,z)
  if q<1.18:h=min(h,-4.2+4.1*max(0,q-.57)/.61)
  if -48<z<-10 and river_distance(x,z)<(2.6 if ice else 3.4):
   if ice:h=min(h,-1+18*max(0,(-z-34)/13)**1.65)
   else:h=min(h,-2.7+max(0,(-z-25))*1.0)
  d=c['near_route'](x,z,route)
  ds=min(math.hypot(x-s['position'][0],z-s['position'][2]) for s in spots)
  safe=max(max(0,1-(d/4.5)**4),max(0,1-(ds/3.4)**4))
  if d<2.2 or ds<1.65:safe=1
  # Stable rock terraces carry the military road and every construction platform.
  return h*(1-safe)
 meta['landmarks']=['central bay','mountain waterfall','shore road','outlet bridge','fishing hamlet','watch camp'] if ice else ['volcano','lava basin','lava river','dragon ribs','broken gate','fortress causeway']
 # Continuous asymmetric massifs with exposed cliffs and windblown snow.
 n,m=161,113;verts=[];faces_by={};minx,maxx,minz,maxz=-105,105,-89,60
 for j in range(m):
  z=minz+j*(maxz-minz)/(m-1)
  for i in range(n):
   x=minx+i*(maxx-minx)/(n-1);verts.append((x,height(x,z),z))
 terrain_faces=[]
 for j in range(m-1):
  for i in range(n-1):
   a=j*n+i;terrain_faces.append((a,a+n,a+n+1,a+1))
 mesh('Carved landscape',verts,terrain_faces,terrainmat,smooth=True)
 # Visible water/lava basins. Holes retain the sniper islands and shore ledges.
 def basin_surface():
  vv=[];ff=[];nx,nz=65,121
  for j in range(nz):
   z=-43+j*67/(nz-1)
   for i in range(nx):vv.append((-20+i*40/(nx-1),-1.05,z))
  for j in range(nz-1):
   for i in range(nx-1):
    k=j*nx+i;ids=(k,k+nx,k+nx+1,k+1)
    if min(bay(vv[v][0],vv[v][2]) for v in ids)<1.5:ff.append(ids)
  mesh('Central bay' if ice else 'Molten basin',vv,ff,water if ice else magma,smooth=True)
 basin_surface()
 # Upstream waterfall or molten torrent connects the mountain to the basin.
 vv=[];ff=[]
 for i in range(81):
  z=-47+i*(13 if ice else 36)/80;x=.4*math.sin(z*.3) if ice else -4+2*math.sin(z*.15)
  width=1.5 if ice else 2.5+.6*math.sin(z*.7)
  y=(-1+18*max(0,(-z-34)/13)**1.65) if ice else -1.05+max(0,(-z-25))*1.0
  for side in [-1,1]:vv.append((x+side*width,y+.08,z))
 for i in range(80):ff.append((i*2,i*2+2,i*2+3,i*2+1))
 mesh('Mountain cascade' if ice else 'Molten torrent',vv,ff,cascade if ice else magma,smooth=True)
 if ice:meta['mist'].append([0,-.4,-33])
 # Original route becomes a deliberately constructed shore/causeway road.
 samples=[]
 for a,b in zip(route,route[1:]):
  a,b=Vector(a),Vector(b);count=max(2,int((b-a).length/.72))
  for j in range(count):samples.append(a.lerp(b,j/count))
 samples.append(Vector(route[-1]));vv=[]
 for i,p in enumerate(samples):
  t=(samples[min(i+1,len(samples)-1)]-samples[max(0,i-1)]).normalized();normal=Vector((-t.z,0,t.x))
  w=1.75+.09*math.sin(i*.41)
  vv.extend([p+normal*w+Vector((0,.075,0)),p-normal*w+Vector((0,.075,0))])
 ff=[]
 for i in range(len(samples)-1):
  if ice and abs(samples[i].x)<5 and 13<samples[i].z<17:continue
  ff.append((i*2,i*2+2,i*2+3,i*2+1))
 mesh('Military shore road',vv,ff,roadmat,smooth=True)
 for i in range(0,len(samples),7):
  p=samples[i]
  if ice and abs(p.x)<5 and p.z>12:continue
  t=(samples[min(i+1,len(samples)-1)]-samples[max(0,i-1)]).normalized();normal=Vector((-t.z,0,t.x))
  for side in [-1,1]:
   at=p+normal*side*1.9
   if random.random()<.20:continue
   size=random.uniform(.25,.46);box('Irregular road edging',(at.x,.1,at.z),(size,.15,random.uniform(.3,.65)),stone,bevel=.07)
  if i%28==0:
   at=p+normal*2.5;c['lantern'](at,ice)
   meta.setdefault('lanterns',[]).append([at.x,at.y+2.25,at.z])
 for s in spots:
  x,y,z=s['position'];tube('Rock tower terrace',(x,-.4,z),(x,.14,z),1.40,stone,r2=1.16,verts=24)
  ring('Terrace inlay',(x,.16,z),1.02,.033,c['ICE'] if s['restricted_to'] else gold)
 def camp(x,z):
  y=height(x,z)
  for dx,dz,sc in [(-3,-1,1.1),(2,2,.8)]:
   xx,zz=x+dx,z+dz;yy=height(xx,zz);w=2.3*sc;h=2.1*sc
   mesh('Watch camp tent',[(xx-w,yy,zz-2),(xx+w,yy,zz-2),(xx,yy+h,zz-2),(xx-w,yy,zz+2),(xx+w,yy,zz+2),(xx,yy+h,zz+2)],[(0,2,5,3),(2,1,4,5),(0,1,2)],c['CLOTH'],smooth=False)
   tube('Tent ridge',(xx,yy+h+.03,zz-2.3),(xx,yy+h+.03,zz+2.3),.05,wood)
  for i in range(6):
   a=i*math.tau/6;tube('Campfire log',(x+math.cos(a),y+.12,z+math.sin(a)),(x-math.cos(a)*.6,y+.17,z-math.sin(a)*.6),.10,wood)
  meta['fires'].append([x,y+.25,z]);meta.setdefault('camps',[]).append([x,y,z])
 def house(x,z,scale):
  y=height(x,z);w=1.8*scale;d=2.2*scale;h=2.5*scale
  box('Village stone footing',(x,y+.2,z),(w*2.1,.4,d*2.1),stone,bevel=.1)
  box('Timber cottage',(x,y+h/2,z),(w*2,h,d*2),wood,bevel=.06)
  roof=[(x-w-.3,y+h,z-d-.3),(x+w+.3,y+h,z-d-.3),(x,y+h+1.8*scale,z-d-.3),(x-w-.3,y+h,z+d+.3),(x+w+.3,y+h,z+d+.3),(x,y+h+1.8*scale,z+d+.3)]
  mesh('Cottage pitched roof',roof,[(0,2,5,3),(2,1,4,5),(0,1,2),(3,5,4)],snow if ice else c['DARK'])
  for side in [-1,1]:
   box('Warm cottage window',(x+side*w*.55,y+h*.64,z+d+.025),(.55*scale,.65*scale,.04),c['WARM'],bevel=.06)
   tube('Window cross',(x+side*w*.55,y+h*.40,z+d+.055),(x+side*w*.55,y+h*.87,z+d+.055),.025,wood)
  box('Cottage door',(x,y+.72*scale,z+d+.035),(.65*scale,1.45*scale,.06),c['DARK'],bevel=.04)
  tube('Chimney',(x+w*.65,y+h,z-.7),(x+w*.65,y+h+2.1*scale,z-.7),.28,stone,verts=8)
  meta.setdefault('homes',[]).append([x,y+1,z])
 # Human landmarks make the road's destination and defensive purpose legible.
 if ice:
  camp(-32,1)
  for x,z,sc in [(31,6,.75),(36,10,1.05),(41,7,.9),(45,13,.65),(32,14,.65)]:house(x,z,sc)
  # Arched bridge at the bay's outlet, narrow enough to defend.
  for i in range(20):
   x=-5.2+i*.55;box('Bridge deck',(x,.02,15),(.53,.18,3.8),wood,bevel=.025)
  for side in [-1,1]:
   curve('Bridge arch',[(-5.5,0,15+side*1.8),(-3,-.8,15+side*1.8),(0,-1.4,15+side*1.8),(3,-.8,15+side*1.8),(5.5,0,15+side*1.8)],.24,stone)
   tube('Bridge rail',(-5.5,.7,15+side*1.9),(5.5,.7,15+side*1.9),.07,wood)
   for x in [-5,-2.5,0,2.5,5]:tube('Bridge post',(x,.05,15+side*1.9),(x,.95,15+side*1.9),.075,wood)
  # A lookout island with a short footbridge to the east shore.
  for x in range(2,11):box('Lookout footbridge',(x,-.05,-20),(.94,.18,1.6),wood,bevel=.04)
  # Dock and moored fishing boat on the sheltered shore.
  for j in range(10):box('Jetty planks',(-7+j*.4,-.7,-4),(.38,.15,2.5),wood,bevel=.025)
  for x in [-7,-5,-3]:tube('Dock piling',(x,-3,-4.9),(x,-.45,-4.9),.10,wood)
  c['ell']('Fishing hull',(-5,-.8,-6.5),(.7,.26,1.7),wood)
 else:
  # Ruined arch over a historic basalt pass.
  for side in [-1,1]:
   for j in range(5):box('Broken gate stone',(-33,-.1+j*.8,-15+side*2.7),(1.1,.72,.95),stone,bevel=.12)
  curve('Broken gate arch',[(-33,3.6,-17.7),(-33,5,-17),(-33,5.7,-15.7)],.36,stone)
  # Dragon remains and a shrine on the basin rim, not evenly spaced scenery.
  for i in range(6):
   z=-3+i*2.0;w=4.2-i*.32;h=3.7-i*.22
   for side in [-1,1]:curve('Ancient dragon rib',[(-5+side*w,-.6,z),(-5+side*w*.85,h*.65,z),(-5+side*w*.3,h,z+.2)],.17,bone)
  for j in range(6):tube('Dragon vertebra',(-5,j*.03+2.7,-3+j*2),(-5,2.7,-2+j*2),.20,bone)
  for x,z in [(-28,6),(-9,20),(20,-27),(36,10),(-47,-6),(-5,-28)]:
   if c['near_route'](x,z,route)>3.5:meta['fires'].append([x,height(x,z)+.25,z])
  for x,z,sc in [(37,8,.8),(43,11,1.05),(31,13,.65)]:house(x,z,sc)
  # A crater and tributary pools make the volcano recognisable at game-camera scale.
  vv=[(-12,26,-53)]
  for i in range(65):
   a=i*math.tau/64;vv.append((-12+math.cos(a)*4.5,26+math.sin(a*5)*.15,-53+math.sin(a)*3.4))
  mesh('Glowing volcanic crater',vv,[(0,i+2,i+1) for i in range(64)],magma)
  meta['fires'].append([-12,27,-53])
 c['fortress'](route[-1],ice);c['portal'](route[0],ice)
 # Clustered, varied vegetation/stone props, instanced by the runtime.
 reserved=[(-32,1,6),(36,10,11)] if ice else [(36,10,10),(-5,3,7)]
 def allowed(x,z,margin=4):
  if c['near_route'](x,z,route)<margin:return False
  if min(math.hypot(x-s['position'][0],z-s['position'][2]) for s in spots)<3.1:return False
  if any(math.hypot(x-a,z-b)<r for a,b,r in reserved):return False
  if min(math.hypot(x-route[k][0],z-route[k][2]) for k in [0,-1])<8:return False
  return height(x,z)>-.35
 if ice:
  clusters=[(-48,12,9,28),(-36,-3,7,19),(28,-3,8,22),(48,18,10,32),(-54,-35,8,22),(57,-37,9,25),(-35,-48,8,21),(37,-46,7,19),(-23,29,9,23),(23,29,9,24)]
  for cx,cz,radius,count in clusters:
   for _ in range(count*2):
    if count<=0:break
    a=random.uniform(0,math.tau);r=radius*math.sqrt(random.random());x=cx+math.cos(a)*r;z=cz+math.sin(a)*r
    if not allowed(x,z):continue
    sc=random.uniform(.55,1.35);meta['instances'].append({'key':'prop_fir_'+str(random.randrange(3)),'position':[x,height(x,z),z],'scale':[sc*random.uniform(.85,1.05),sc*random.uniform(.9,1.35),sc*random.uniform(.85,1.1)],'yaw':random.uniform(0,math.tau)})
    count-=1
 for _ in range(190):
  x=random.uniform(-69,69);z=random.uniform(-53,35)
  if not allowed(x,z,3.5):continue
  sc=random.uniform(.55,2.2)
  meta['instances'].append({'key':('prop_snowrock_' if ice else 'prop_basalt_')+str(random.randrange(3)),'position':[x,height(x,z)-.15,z],'scale':[sc*random.uniform(.7,1.7),sc*random.uniform(.7,1.7),sc*random.uniform(.8,1.4)],'yaw':random.uniform(0,math.tau)})
  if not ice and sc>1.7:
   tube('Charred crooked tree',(x,height(x,z),z),(x+.3,height(x,z)+3.2,z-.2),.13,wood,r2=.025)
   tube('Broken limb',(x+.2,height(x,z)+1.8,z),(x+1.1,height(x,z)+2.4,z+.4),.06,wood,r2=.01)
 c['FAST_WORLD']=False;c['flush_world']();c['export']('world_'+mapid)
 path=c['R']/'data/landscapes.json';existing=json.loads(path.read_text()) if path.exists() else {};existing[mapid]=meta
 path.write_text(json.dumps(existing,ensure_ascii=False,indent=2)+'\n')
