from pathlib import Path
import subprocess, tempfile, os, json
root=Path(__file__).resolve().parent.parent
java=Path(os.environ.get('JAVA_HOME', str(Path.home()/'.local/tools/jdk-17.0.18+8/Contents/Home')))/'bin'
source=root/'yuhui-server/marketing/src/main/java/com/yuhui/marketing/raffle/service/armory/algorithm/AliasTable.java'
test='''import com.yuhui.marketing.raffle.service.armory.algorithm.AliasTable;
import java.math.BigDecimal; import java.util.*;
public class AliasCheck {
 static int checks=0;
 static void check(boolean b){if(!b)throw new AssertionError("check "+checks); checks++;}
 static AliasTable table(String... w){List<Long> ids=new ArrayList<>();List<BigDecimal> weights=new ArrayList<>();for(int i=0;i<w.length;i++){ids.add((long)i);weights.add(new BigDecimal(w[i]));}return new AliasTable(ids,weights);}
 static void invalid(Runnable r){try{r.run();throw new AssertionError("accepted invalid input");}catch(IllegalArgumentException expected){checks++;}}
 public static void main(String[] args){
  invalid(()->table());invalid(()->table("0","0"));invalid(()->table("-1","2"));
  invalid(()->new AliasTable(Arrays.asList(1L,1L),List.of(BigDecimal.ONE,BigDecimal.ONE)));
  AliasTable singleton=table("2");check(singleton.sample(0,0)==0);check(singleton.sample(0,.999999)==0);
  AliasTable zero=table("0","3","0");for(int i=0;i<3;i++){check(zero.sample(i,0)==1);check(zero.sample(i,.99999)==1);}
  invalid(()->zero.sample(0,Double.NaN));invalid(()->zero.sample(0,1));invalid(()->zero.sample(-1,0));
  AliasTable tiny=table("0.000000000001","0.999999999999");check(tiny.size()==2);check(tiny.sample(0,0)==0);
  AliasTable weighted=table("2","3","5","0");long[] count=new long[4];Random random=new Random(20261011);int draws=1000000;
  for(int i=0;i<draws;i++) count[(int)weighted.sample(random.nextInt(4),random.nextDouble())]++;
  double[] expected={.2,.3,.5,0}; for(int i=0;i<4;i++) check(Math.abs(count[i]/(double)draws-expected[i])<.003);
  // Reconstruct the exact categorical distribution independently from all alias rows.
  double[] mass=new double[4]; for(int i=0;i<4;i++){String[] row=weighted.row(i).split(",");double p=Double.parseDouble(row[0]);mass[Integer.parseInt(row[1])]+=p/4;mass[Integer.parseInt(row[2])]+=(1-p)/4;}
  for(int i=0;i<4;i++)check(Math.abs(mass[i]-expected[i])<1e-12);
  System.out.println("PASS "+checks+" assertions; 1000000 seeded samples: "+Arrays.toString(count));
 }
}'''
with tempfile.TemporaryDirectory() as tmp:
 p=Path(tmp)/'AliasCheck.java';p.write_text(test)
 subprocess.run([str(java/'javac'),'-d',tmp,str(source),str(p)],check=True)
 result=subprocess.run([str(java/'java'),'-cp',tmp,'AliasCheck'],check=True,capture_output=True,text=True)
 print(result.stdout.strip());(root/'verification/alias.json').write_text(json.dumps({'result':'PASS','output':result.stdout.strip(),'scope':'Pure algorithm, not throughput or concurrency benchmark'},ensure_ascii=False,indent=2))
