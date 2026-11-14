import React from 'react';
import {
  AssessmentData,
  CEK_HP_OPTIONS,
  DIET_YOYO_OPTIONS,
  GOAL_OPTIONS,
  JENIS_MAKAN_DI_LUAR_OPTIONS,
  KAPAN_MULAI_OPTIONS,
  KEBANGUN_MALAM_OPTIONS,
  KOMPOSISI_TUBUH_OPTIONS,
  LANGKAH_OPTIONS,
  NGEMIL_OPTIONS,
  PERNAH_DICOBA_OPTIONS,
  PROTEIN_OPTIONS,
  RESPON_TELAT_MAKAN_OPTIONS,
  SectionId,
  STAMINA_OPTIONS,
  TREN_BB_OPTIONS,
} from '../types/assessment';
import { FormErrors, isValidEmail } from '../utils/validation';
import {
  CheckboxGroupField,
  LinearScaleField,
  NumberField,
  RadioGroupField,
  TextareaField,
  TextField,
} from './FormFields';

interface SectionFormsProps {
  sectionId: SectionId;
  data: AssessmentData;
  errors: FormErrors;
  onChange: <K extends keyof AssessmentData>(
    field: K,
    value: AssessmentData[K]
  ) => void;
  onBlurField: (field: keyof AssessmentData) => void;
}

export const SectionForms: React.FC<SectionFormsProps> = ({
  sectionId,
  data,
  errors,
  onChange,
  onBlurField,
}) => {
  switch (sectionId) {
    case 1:
      return (
        <div className="space-y-6">
          <TextField
            id="namaLengkap"
            label="Nama Lengkap"
            value={data.namaLengkap}
            onChange={(val) => onChange('namaLengkap', val)}
            onBlur={() => onBlurField('namaLengkap')}
            placeholder="Contoh: Raka Pratama Wijaya"
            autoComplete="name"
            error={errors.namaLengkap}
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <TextField
              id="email"
              type="email"
              label="Email"
              value={data.email}
              onChange={(val) => onChange('email', val)}
              onBlur={() => onBlurField('email')}
              placeholder="nama@email.com"
              hint="Pastikan format email benar agar hasil evaluasi dapat dikirim."
              autoComplete="email"
              error={errors.email}
              isValidBadge={
                isValidEmail(data.email) ? 'Format email valid' : undefined
              }
            />

            <TextField
              id="whatsapp"
              type="tel"
              label="Nomor WhatsApp"
              value={data.whatsapp}
              onChange={(val) => onChange('whatsapp', val)}
              onBlur={() => onBlurField('whatsapp')}
              placeholder="081234567890"
              hint="Gunakan nomor aktif yang terhubung ke WhatsApp."
              autoComplete="tel"
              error={errors.whatsapp}
            />
          </div>

          <div className="border-t border-slate-100 pt-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <NumberField
                id="usia"
                label="Usia"
                value={data.usia}
                onChange={(val) => onChange('usia', val)}
                onBlur={() => onBlurField('usia')}
                unit="tahun"
                placeholder="30"
                min={10}
                max={110}
                error={errors.usia}
              />

              <RadioGroupField
                id="jenisKelamin"
                label="Jenis Kelamin"
                value={data.jenisKelamin}
                options={['Laki-laki', 'Perempuan']}
                onChange={(val) =>
                  onChange('jenisKelamin', val as 'Laki-laki' | 'Perempuan')
                }
                columns={2}
                error={errors.jenisKelamin}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <NumberField
              id="tinggiBadan"
              label="Tinggi Badan"
              value={data.tinggiBadan}
              onChange={(val) => onChange('tinggiBadan', val)}
              onBlur={() => onBlurField('tinggiBadan')}
              unit="cm"
              placeholder="170"
              min={80}
              max={250}
              error={errors.tinggiBadan}
            />

            <NumberField
              id="beratBadan"
              label="Berat Badan"
              value={data.beratBadan}
              onChange={(val) => onChange('beratBadan', val)}
              onBlur={() => onBlurField('beratBadan')}
              unit="kg"
              placeholder="72"
              min={25}
              max={300}
              step="0.1"
              error={errors.beratBadan}
            />
          </div>
        </div>
      );

    case 2:
      return (
        <div className="space-y-8">
          <CheckboxGroupField
            id="goalUtama"
            label="Apa goal utama kamu?"
            hint="Kamu bisa memilih lebih dari satu tujuan yang paling penting saat ini."
            values={data.goalUtama}
            options={GOAL_OPTIONS}
            onChange={(vals) => onChange('goalUtama', vals)}
            otherValue={data.goalLainnya}
            onOtherChange={(val) => onChange('goalLainnya', val)}
            otherPlaceholder="Goal lainnya (opsional), mis. persiapan maraton atau pemulihan cedera..."
            error={errors.goalUtama}
          />

          <div className="border-t border-slate-100 pt-7">
            <RadioGroupField
              id="kapanMulai"
              label="Kapan mau mulai?"
              value={data.kapanMulai}
              options={KAPAN_MULAI_OPTIONS}
              onChange={(val) => onChange('kapanMulai', val)}
              columns={2}
              error={errors.kapanMulai}
            />
          </div>

          <div className="border-t border-slate-100 pt-7">
            <CheckboxGroupField
              id="pernahDicoba"
              label="Apa aja yang pernah kamu coba?"
              hint="Pilih semua metode atau program yang pernah kamu jalani sebelumnya."
              values={data.pernahDicoba}
              options={PERNAH_DICOBA_OPTIONS}
              onChange={(vals) => onChange('pernahDicoba', vals)}
              otherValue={data.pernahDicobaLainnya}
              onOtherChange={(val) => onChange('pernahDicobaLainnya', val)}
              otherPlaceholder="Program lain yang pernah dicoba (opsional)..."
              error={errors.pernahDicoba}
            />
          </div>
        </div>
      );

    case 3:
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <NumberField
              id="makanDiLuarPerMinggu"
              label="Seminggu berapa kali kamu makan di luar, dinner client, atau pesan online?"
              hint="Hitung total frekuensi makan yang bukan masakan rumah dalam 7 hari."
              value={data.makanDiLuarPerMinggu}
              onChange={(val) => onChange('makanDiLuarPerMinggu', val)}
              onBlur={() => onBlurField('makanDiLuarPerMinggu')}
              unit="kali / minggu"
              placeholder="4"
              min={0}
              max={35}
              error={errors.makanDiLuarPerMinggu}
            />

            <NumberField
              id="minumanManisPerHari"
              label="Berapa minuman manis per hari?"
              hint="Termasuk kopi susu gula aren, teh manis, boba, jus kemasan, atau soda."
              value={data.minumanManisPerHari}
              onChange={(val) => onChange('minumanManisPerHari', val)}
              onBlur={() => onBlurField('minumanManisPerHari')}
              unit="gelas / hari"
              placeholder="1"
              min={0}
              max={20}
              error={errors.minumanManisPerHari}
            />
          </div>

          <div className="border-t border-slate-100 pt-7">
            <RadioGroupField
              id="jenisMakanDiLuar"
              label="Kebiasaan dinner client atau pesan online mana yang paling sering kamu alami?"
              value={data.jenisMakanDiLuar}
              options={JENIS_MAKAN_DI_LUAR_OPTIONS}
              onChange={(val) => onChange('jenisMakanDiLuar', val)}
              columns={2}
              error={errors.jenisMakanDiLuar}
            />
          </div>

          <div className="border-t border-slate-100 pt-7">
            <RadioGroupField
              id="frekuensiProtein"
              label="Seberapa sering ada protein di piring kamu?"
              hint="Contoh sumber protein: telur, ayam, ikan, daging tanpa lemak, tahu, atau tempe."
              value={data.frekuensiProtein}
              options={PROTEIN_OPTIONS.map((o) => ({
                value: o.value,
                label: o.value,
                desc: o.desc,
              }))}
              onChange={(val) =>
                onChange(
                  'frekuensiProtein',
                  val as 'Selalu' | 'Sering' | 'Jarang'
                )
              }
              columns={3}
              error={errors.frekuensiProtein}
            />
          </div>

          <div className="border-t border-slate-100 pt-7">
            <RadioGroupField
              id="frekuensiNgemil"
              label="Seberapa sering kamu ngemil?"
              value={data.frekuensiNgemil}
              options={NGEMIL_OPTIONS}
              onChange={(val) => onChange('frekuensiNgemil', val)}
              columns={2}
              error={errors.frekuensiNgemil}
            />
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-7">
            <RadioGroupField
              id="responTelatMakan"
              label="Kalau telat makan biasanya kamu gimana?"
              value={data.responTelatMakan}
              options={RESPON_TELAT_MAKAN_OPTIONS}
              onChange={(val) => onChange('responTelatMakan', val)}
              columns={2}
              error={errors.responTelatMakan}
            />

            <TextareaField
              id="responTelatMakanDetail"
              label="Ceritakan detail kebiasaan saat telat makan (opsional)"
              required={false}
              rows={2}
              value={data.responTelatMakanDetail}
              onChange={(val) => onChange('responTelatMakanDetail', val)}
              placeholder="Contoh: Biasanya kalau meeting panjang, makan siang baru jam 3 sore lalu langsung pesan porsi besar..."
            />
          </div>
        </div>
      );

    case 4:
      return (
        <div className="space-y-8">
          <TextareaField
            id="energiSore"
            label="Jam 2–4 sore energi kamu gimana?"
            hint="Apakah terasa stabil, mengantuk berat (food coma), butuh kafein tambahan, atau mudah lelah?"
            value={data.energiSore}
            onChange={(val) => onChange('energiSore', val)}
            onBlur={() => onBlurField('energiSore')}
            placeholder="Contoh: Biasanya jam 2 siang mulai ngantuk berat dan susah fokus sampai harus minum kopi lagi..."
            error={errors.energiSore}
          />

          <div className="grid grid-cols-1 gap-6 border-t border-slate-100 pt-7 sm:grid-cols-3">
            <NumberField
              id="kafeinPerHari"
              label="Berapa gelas kopi / kafein per hari?"
              value={data.kafeinPerHari}
              onChange={(val) => onChange('kafeinPerHari', val)}
              onBlur={() => onBlurField('kafeinPerHari')}
              unit="gelas"
              placeholder="2"
              min={0}
              max={15}
              error={errors.kafeinPerHari}
            />

            <NumberField
              id="latihanBebanPerMinggu"
              label="Berapa kali seminggu kamu latihan beban?"
              value={data.latihanBebanPerMinggu}
              onChange={(val) => onChange('latihanBebanPerMinggu', val)}
              onBlur={() => onBlurField('latihanBebanPerMinggu')}
              unit="kali"
              placeholder="2"
              min={0}
              max={14}
              error={errors.latihanBebanPerMinggu}
            />

            <NumberField
              id="jamDudukPerHari"
              label="Total berapa jam kamu duduk per hari?"
              value={data.jamDudukPerHari}
              onChange={(val) => onChange('jamDudukPerHari', val)}
              onBlur={() => onBlurField('jamDudukPerHari')}
              unit="jam"
              placeholder="8"
              min={0}
              max={24}
              step="0.5"
              error={errors.jamDudukPerHari}
            />
          </div>

          <div className="border-t border-slate-100 pt-7">
            <TextareaField
              id="rasaBangunPagi"
              label="Waktu bangun pagi rasanya gimana?"
              hint="Misalnya langsung segar, masih berat/lemas, badan pegal, atau harus menunda alarm berkali-kali."
              value={data.rasaBangunPagi}
              onChange={(val) => onChange('rasaBangunPagi', val)}
              onBlur={() => onBlurField('rasaBangunPagi')}
              placeholder="Contoh: Bangun pagi sering terasa berat dan badan kaku meski tidur terasa cukup..."
              error={errors.rasaBangunPagi}
            />
          </div>

          <div className="border-t border-slate-100 pt-7">
            <RadioGroupField
              id="stamina5Tahun"
              label="Stamina dibanding 5 tahun lalu?"
              value={data.stamina5Tahun}
              options={STAMINA_OPTIONS.map((o) => ({
                value: o.value,
                label: o.value,
                desc: o.desc,
              }))}
              onChange={(val) =>
                onChange('stamina5Tahun', val as 'Lebih baik' | 'Sama' | 'Buruk')
              }
              columns={3}
              error={errors.stamina5Tahun}
            />
          </div>

          <div className="border-t border-slate-100 pt-7">
            <TextareaField
              id="fokusKerja"
              label="Fokus dan kejernihan pikiran pas kerja bagaimana?"
              value={data.fokusKerja}
              onChange={(val) => onChange('fokusKerja', val)}
              onBlur={() => onBlurField('fokusKerja')}
              placeholder="Contoh: Pagi hari masih tajam, tetapi setelah siang sering mengalami brain fog..."
              error={errors.fokusKerja}
            />
          </div>

          <div className="border-t border-slate-100 pt-7">
            <RadioGroupField
              id="langkahHarian"
              label="Kira-kira berapa langkah kaki kamu per hari?"
              value={data.langkahHarian}
              options={LANGKAH_OPTIONS}
              onChange={(val) => onChange('langkahHarian', val)}
              columns={2}
              error={errors.langkahHarian}
            />
          </div>

          <div className="border-t border-slate-100 pt-7">
            <TextareaField
              id="naikTangga3Lantai"
              label="Naik tangga 3 lantai, rasanya gimana?"
              value={data.naikTangga3Lantai}
              onChange={(val) => onChange('naikTangga3Lantai', val)}
              onBlur={() => onBlurField('naikTangga3Lantai')}
              placeholder="Contoh: Sampai lantai 3 napas cukup ngos-ngosan dan kaki terasa berat..."
              error={errors.naikTangga3Lantai}
            />
          </div>
        </div>
      );

    case 5:
      return (
        <div className="space-y-8">
          <NumberField
            id="jamTidurRataRata"
            label="Rata-rata kamu tidur berapa jam per malam?"
            value={data.jamTidurRataRata}
            onChange={(val) => onChange('jamTidurRataRata', val)}
            onBlur={() => onBlurField('jamTidurRataRata')}
            unit="jam / malam"
            placeholder="6.5"
            min={1}
            max={20}
            step="0.5"
            error={errors.jamTidurRataRata}
          />

          <div className="border-t border-slate-100 pt-7">
            <TextareaField
              id="waktuSampaiTertidur"
              label="Biasanya berapa lama sampai kamu tertidur?"
              hint="Ceritakan apakah langsung terlelap dalam < 15 menit atau butuh waktu lama karena pikiran masih aktif."
              value={data.waktuSampaiTertidur}
              onChange={(val) => onChange('waktuSampaiTertidur', val)}
              onBlur={() => onBlurField('waktuSampaiTertidur')}
              placeholder="Contoh: Sekitar 30–45 menit setelah berbaring, kadang lebih lama kalau pekerjaan menumpuk..."
              error={errors.waktuSampaiTertidur}
            />
          </div>

          <div className="border-t border-slate-100 pt-7">
            <RadioGroupField
              id="cekHpMenjelangTidur"
              label="Menjelang tidur kamu masih cek HP / email?"
              value={data.cekHpMenjelangTidur}
              options={CEK_HP_OPTIONS}
              onChange={(val) => onChange('cekHpMenjelangTidur', val)}
              columns={2}
              error={errors.cekHpMenjelangTidur}
            />
          </div>

          <div className="border-t border-slate-100 pt-7">
            <LinearScaleField
              id="levelStresKerja"
              label="Level stres kerja seminggu terakhir (1–10)?"
              value={data.levelStresKerja}
              onChange={(val) => onChange('levelStresKerja', val)}
              minLabel="Sangat tenang"
              maxLabel="Sangat tertekan"
              error={errors.levelStresKerja}
            />
          </div>

          <div className="border-t border-slate-100 pt-7">
            <RadioGroupField
              id="frekuensiKebangunMalam"
              label="Seberapa sering kamu kebangun tengah malam?"
              value={data.frekuensiKebangunMalam}
              options={KEBANGUN_MALAM_OPTIONS}
              onChange={(val) => onChange('frekuensiKebangunMalam', val)}
              columns={2}
              error={errors.frekuensiKebangunMalam}
            />
          </div>
        </div>
      );

    case 6:
      return (
        <div className="space-y-8">
          <RadioGroupField
            id="trenBeratBadan3Tahun"
            label="Berat badan kamu dalam 3 tahun terakhir?"
            value={data.trenBeratBadan3Tahun}
            options={TREN_BB_OPTIONS.map((o) => ({
              value: o.value,
              label: o.value,
              desc: o.desc,
            }))}
            onChange={(val) =>
              onChange(
                'trenBeratBadan3Tahun',
                val as 'Naik' | 'Turun' | 'Stabil'
              )
            }
            columns={3}
            error={errors.trenBeratBadan3Tahun}
          />

          <div className="border-t border-slate-100 pt-7">
            <TextareaField
              id="lingkarPerutUkuranCelana"
              label="Gimana lingkar perut atau ukuran celana kamu?"
              hint="Ceritakan perubahan ukuran celana atau bagian tubuh yang terasa paling berubah belakangan ini."
              value={data.lingkarPerutUkuranCelana}
              onChange={(val) => onChange('lingkarPerutUkuranCelana', val)}
              onBlur={() => onBlurField('lingkarPerutUkuranCelana')}
              placeholder="Contoh: Ukuran celana naik dari 30 ke 33 dalam dua tahun terakhir dan terasa sesak di bagian perut..."
              error={errors.lingkarPerutUkuranCelana}
            />
          </div>

          <div className="border-t border-slate-100 pt-7">
            <RadioGroupField
              id="siklusDietYoyo"
              label="Berapa kali kamu diet, lalu beratnya balik lagi?"
              value={data.siklusDietYoyo}
              options={DIET_YOYO_OPTIONS}
              onChange={(val) => onChange('siklusDietYoyo', val)}
              columns={2}
              error={errors.siklusDietYoyo}
            />
          </div>

          <div className="border-t border-slate-100 pt-7">
            <RadioGroupField
              id="ukurKomposisiTubuh"
              label="Pernah ukur komposisi tubuh?"
              hint="Seperti persentase lemak tubuh & massa otot melalui InBody, DEXA scan, atau smart scale."
              value={data.ukurKomposisiTubuh}
              options={KOMPOSISI_TUBUH_OPTIONS}
              onChange={(val) => onChange('ukurKomposisiTubuh', val)}
              columns={1}
              error={errors.ukurKomposisiTubuh}
            />
          </div>

          <div className="border-t border-slate-100 pt-7">
            <LinearScaleField
              id="keyakinanPahamTubuh"
              label="Seberapa yakin kamu tahu kondisi badan kamu kayak sekarang (1–10)?"
              hint="Menilai seberapa paham kamu terhadap kebutuhan nutrisi, metabolisme, dan respons tubuhmu sendiri."
              value={data.keyakinanPahamTubuh}
              onChange={(val) => onChange('keyakinanPahamTubuh', val)}
              minLabel="Sangat ragu / bingung"
              maxLabel="Sangat yakin & paham"
              error={errors.keyakinanPahamTubuh}
            />
          </div>
        </div>
      );
  }
};
