import {
  faArrowRight,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons'
import { Checkbox, List, Popover, Radio, Slider, Space, Typography } from 'antd'
import { t } from 'i18next'
import { ZH_PERSON_RULES } from '../../../core/consts.js'
import { FlexBox } from '../../components/flex-box.js'
import { Icon } from '../../components/icon.js'
import { RInputNumber } from '../../components/input-number.js'
import {
  SPLIT_PAGE_TYPES,
  USER_COLOR_SCHEMES,
  useAutoSection,
  useDisabledVertical,
  useFontSize,
  usePageList,
  useParagraphRepeat,
  usePersonReplace,
  useSpeechSpeed,
  useStopTimer,
  useStopTimerSeconds,
  useUserColorScheme,
  type PageListType,
  type UserColorscheme,
} from '../../store.js'

export function SettingLine({ children }: { children: React.ReactNode }) {
  return (
    <FlexBox
      dir="row"
      gap={8}
      style={{
        alignItems: 'center',
        width: '100%',
      }}
    >
      {children}
    </FlexBox>
  )
}

export function SettingLabel({
  style,
  children,
}: {
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  return (
    <Typography style={{ alignSelf: 'start', ...style }}>{children}</Typography>
  )
}

const AutoSectionCheckBox = () => {
  const [autoNextSection, setAutoNextSection] = useAutoSection()
  return (
    <SettingLine>
      <Checkbox
        checked={autoNextSection}
        onChange={(e) => setAutoNextSection(e.target.checked)}
      >
        {t('setting.autoNextSection')}
      </Checkbox>
    </SettingLine>
  )
}

const TimerInput = () => {
  const [stopTimerEnabled, setStopTimerEnabled] = useStopTimer()
  const [stopTimerSeconds, setStopTimerSeconds] = useStopTimerSeconds()
  return (
    <SettingLine>
      <Checkbox
        checked={stopTimerEnabled}
        onChange={(e) => {
          setStopTimerEnabled(e.target.checked)
        }}
      >
        {t('setting.timer')}
      </Checkbox>
      <RInputNumber
        style={{ width: '80px' }}
        disabled={!stopTimerEnabled}
        value={Math.floor(stopTimerSeconds / 60)}
        onChange={(v) => {
          if (v === null) return
          setStopTimerSeconds(Math.floor(v * 60))
        }}
      ></RInputNumber>
    </SettingLine>
  )
}

function PersonReplaceCheckBox({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <>
      <Checkbox
        checked={checked}
        onChange={(e) => {
          onChange(e.target.checked)
        }}
      >
        {t('setting.personReplace')}
      </Checkbox>
      <Popover
        style={{ pointerEvents: 'none' }}
        content={
          <List>
            {Object.entries(ZH_PERSON_RULES).map(([from, to], idx) => {
              return (
                <List.Item key={idx}>
                  <Space>
                    {from}
                    <Icon icon={faArrowRight} />
                    {to.word} ({to.pinyin})
                  </Space>
                </List.Item>
              )
            })}
          </List>
        }
      >
        <div>
          <Icon size="lg" icon={faQuestionCircle} />
        </div>
      </Popover>
    </>
  )
}

const PersonReplaceUI = () => {
  const [isPersonReplace, setIsPersonReplace] = usePersonReplace()

  return (
    <SettingLine>
      <PersonReplaceCheckBox
        checked={isPersonReplace}
        onChange={(v) => {
          setIsPersonReplace(v)
        }}
      ></PersonReplaceCheckBox>
    </SettingLine>
  )
}

function DisabledVerticalCheckbox() {
  const [disabledVertical, setDisabledVertical] = useDisabledVertical()
  return (
    <SettingLine>
      <Checkbox
        checked={disabledVertical}
        onChange={(e) => {
          setDisabledVertical(e.target.checked)
        }}
      >
        {t('setting.disabledVertical')}
      </Checkbox>
    </SettingLine>
  )
}

const PlaySpeed = () => {
  const [speechSpeed, setSpeechSpeed] = useSpeechSpeed()
  return (
    <SettingLine>
      <SettingLabel>{t('setting.speed')}</SettingLabel>
      <FlexBox style={{ flex: 1 }}>
        <Slider
          value={speechSpeed}
          onChange={(v) => {
            setSpeechSpeed(v)
          }}
          step={0.1}
          min={0.1}
          max={5.0}
        ></Slider>
        <RInputNumber
          type="number"
          value={speechSpeed}
          step={0.1}
          onChange={(v) => {
            if (v === null) return
            setSpeechSpeed(v)
          }}
        ></RInputNumber>
      </FlexBox>
    </SettingLine>
  )
}

const ColorSchemeSelect = () => {
  const [userColorScheme, setUserColorScheme] = useUserColorScheme()
  return (
    <>
      <SettingLine>
        <SettingLabel style={{ paddingTop: '4px' }}>
          {t('setting.userColorScheme')}
        </SettingLabel>
        <Radio.Group
          value={userColorScheme}
          onChange={(e) => {
            setUserColorScheme(e.target.value as UserColorscheme)
          }}
        >
          <Space direction="vertical">
            {USER_COLOR_SCHEMES.map((value) => {
              return (
                <Radio key={value} value={value}>
                  {t(value)}
                </Radio>
              )
            })}
          </Space>
        </Radio.Group>
      </SettingLine>
    </>
  )
}

const ParagraphRepeatInput = () => {
  const [paragraphRepeat, setParagraphRepeat] = useParagraphRepeat()
  return (
    <SettingLine>
      <span>{t('setting.paragraphRepeat')}:</span>
      <RInputNumber
        style={{ width: 80 }}
        value={paragraphRepeat}
        onChange={(v) => {
          if (!v) return
          setParagraphRepeat(v < 1 ? 1 : Math.floor(v))
        }}
      ></RInputNumber>
    </SettingLine>
  )
}

function PageListCheckBox() {
  const [pageList, setPageList] = usePageList()
  return (
    <SettingLine>
      <SettingLabel style={{ paddingTop: '4px' }}>
        {t('setting.pageList')}
      </SettingLabel>
      <Radio.Group
        value={pageList}
        onChange={(e) => {
          setPageList(e.target.value as PageListType)
        }}
      >
        <Space direction="vertical">
          {SPLIT_PAGE_TYPES.map((value) => {
            return (
              <Radio key={value} value={value}>
                {t(`setting.pageListType.${value}`)}
              </Radio>
            )
          })}
        </Space>
      </Radio.Group>
    </SettingLine>
  )
}

function FontSizeInput() {
  const [fontSize, setFontSize] = useFontSize()
  return (
    <SettingLine>
      <span>{t('setting.fontSize')}</span>
      <RInputNumber
        style={{ width: 80 }}
        value={fontSize}
        onChange={(v) => {
          if (v === null) return
          setFontSize(v < 1 ? 1 : Math.floor(v))
        }}
      ></RInputNumber>
    </SettingLine>
  )
}

export const GlobalSettings = () => {
  return (
    <Space direction="vertical">
      <AutoSectionCheckBox></AutoSectionCheckBox>
      <TimerInput></TimerInput>
      <PersonReplaceUI></PersonReplaceUI>
      <DisabledVerticalCheckbox></DisabledVerticalCheckbox>
      <PlaySpeed></PlaySpeed>
      <ColorSchemeSelect></ColorSchemeSelect>
      <ParagraphRepeatInput></ParagraphRepeatInput>
      <PageListCheckBox></PageListCheckBox>
      <FontSizeInput></FontSizeInput>
    </Space>
  )
}
