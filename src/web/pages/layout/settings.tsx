import { ArrowRight, Help } from '@mui/icons-material'
import type { SxProps, Theme } from '@mui/material'
import {
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  Popover,
  Radio,
  RadioGroup,
  Slider,
  TextField,
  Typography,
} from '@mui/material'
import { t } from 'i18next'
import { useState } from 'react'
import { ZH_PERSON_RULES } from '../../../core/consts.js'
import { isMobile } from '../../../core/util/browser.js'
import { FlexBox } from '../../components/flex-box.js'
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
      }}
    >
      {children}
    </FlexBox>
  )
}

export function SettingLabel({
  sx,
  children,
}: {
  sx?: SxProps<Theme>
  children: React.ReactNode
}) {
  return <Typography sx={{ alignSelf: 'start', ...sx }}>{children}</Typography>
}

const AutoSectionCheckBox = () => {
  const [autoNextSection, setAutoNextSection] = useAutoSection()
  return (
    <SettingLine>
      <FormControlLabel
        label={t('setting.autoNextSection')}
        control={
          <Checkbox
            checked={autoNextSection}
            onChange={(v) => {
              setAutoNextSection(v.currentTarget.checked)
            }}
          ></Checkbox>
        }
      ></FormControlLabel>
    </SettingLine>
  )
}

const TimerInput = () => {
  const [stopTimerEnabled, setStopTimerEnabled] = useStopTimer()
  const [stopTimerSeconds, setStopTimerSeconds] = useStopTimerSeconds()
  return (
    <SettingLine>
      <FormControlLabel
        label={t('setting.timer')}
        control={
          <Checkbox
            checked={stopTimerEnabled}
            onChange={(e) => {
              setStopTimerEnabled(e.target.checked)
            }}
          ></Checkbox>
        }
      ></FormControlLabel>
      <TextField
        type="number"
        sx={{ width: 80 }}
        disabled={!stopTimerEnabled}
        value={Math.floor(stopTimerSeconds / 60)}
        onChange={(e) => {
          const f = parseFloat(e.target.value)
          if (!isNaN(f)) setStopTimerSeconds(Math.floor(f * 60))
        }}
        inputProps={{ sx: { textAlign: 'right' } }}
      ></TextField>
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
  const [personReplaceOpened, setPersonReplaceOpened] = useState<boolean>(false)
  const [anchor, setAnchor] = useState<any>()

  return (
    <>
      <FormControlLabel
        label={t('setting.personReplace')}
        control={
          <Checkbox
            checked={checked}
            onChange={(v) => {
              onChange(v.currentTarget.checked)
            }}
          ></Checkbox>
        }
      ></FormControlLabel>
      <Help
        onMouseEnter={(e) => {
          if (isMobile) return
          setAnchor(e.currentTarget)
          setPersonReplaceOpened(true)
        }}
        onMouseLeave={(e) => {
          setAnchor(e.currentTarget)
          setPersonReplaceOpened(false)
        }}
      ></Help>
      {!isMobile && (
        <Popover
          sx={{ pointerEvents: 'none' }}
          open={personReplaceOpened}
          anchorEl={anchor}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <List>
            {Object.entries(ZH_PERSON_RULES).map(([from, to], idx) => {
              return (
                <ListItem key={idx}>
                  {from} <ArrowRight /> {to.word} {to.pinyin}
                </ListItem>
              )
            })}
          </List>
        </Popover>
      )}
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

const PlaySpeed = () => {
  const [speechSpeed, setSpeechSpeed] = useSpeechSpeed()
  return (
    <SettingLine>
      <SettingLabel>{t('setting.speed')}</SettingLabel>
      <FlexBox>
        <Slider
          value={speechSpeed}
          onChange={(_, v) => {
            setSpeechSpeed(v as number)
          }}
          step={0.1}
          min={0.1}
          max={5.0}
        ></Slider>
        <TextField
          type="number"
          value={speechSpeed}
          onChange={(e) => {
            const f = parseFloat(e.target.value)
            if (!isNaN(f)) setSpeechSpeed(f)
          }}
          inputProps={{
            step: '0.1',
          }}
        ></TextField>
      </FlexBox>
    </SettingLine>
  )
}

const ColorSchemeSelect = () => {
  const [userColorScheme, setUserColorScheme] = useUserColorScheme()
  return (
    <>
      <SettingLine>
        <SettingLabel sx={{ paddingTop: 1 }}>
          {t('setting.userColorScheme')}
        </SettingLabel>
        <RadioGroup
          defaultValue={userColorScheme}
          onChange={(e) => {
            setUserColorScheme(e.target.value as UserColorscheme)
          }}
        >
          {USER_COLOR_SCHEMES.map((value) => {
            return (
              <FormControlLabel
                key={value}
                label={t(value)}
                value={value}
                control={<Radio></Radio>}
              ></FormControlLabel>
            )
          })}
        </RadioGroup>
      </SettingLine>
    </>
  )
}

const ParagraphRepeatInput = () => {
  const [paragraphRepeat, setParagraphRepeat] = useParagraphRepeat()
  return (
    <SettingLine>
      <span>{t('setting.paragraphRepeat')}:</span>
      <TextField
        type="number"
        sx={{ width: 80 }}
        defaultValue={paragraphRepeat}
        onChange={(e) => {
          const f = parseInt(e.target.value, 10)
          if (!isNaN(f)) setParagraphRepeat(f < 1 ? 1 : Math.floor(f))
        }}
      ></TextField>
    </SettingLine>
  )
}

function PageListCheckBox() {
  const [pageList, setPageList] = usePageList()
  return (
    <SettingLine>
      <SettingLabel sx={{ paddingTop: 1 }}>
        {t('setting.pageList')}
      </SettingLabel>
      <RadioGroup
        defaultValue={pageList}
        onChange={(e) => {
          setPageList(e.target.value as PageListType)
        }}
      >
        {SPLIT_PAGE_TYPES.map((value) => {
          return (
            <FormControlLabel
              key={value}
              label={t(`setting.pageListType.${value}`)}
              value={value}
              control={<Radio></Radio>}
            ></FormControlLabel>
          )
        })}
      </RadioGroup>
    </SettingLine>
  )
}

function FontSizeInput() {
  const [fontSize, setFontSize] = useFontSize()
  return (
    <SettingLine>
      <span>{t('setting.fontSize')}</span>
      <TextField
        type="number"
        sx={{ width: 80 }}
        defaultValue={fontSize}
        onChange={(e) => {
          const f = parseInt(e.target.value, 10)
          if (!isNaN(f)) setFontSize(f < 1 ? 1 : Math.floor(f))
        }}
      ></TextField>
    </SettingLine>
  )
}

function DiabledVerticalCheckbox() {
  const [disabledVertical, setDisabledVertical] = useDisabledVertical()
  return (
    <SettingLine>
      <FormControlLabel
        label={t('setting.disabledVertical')}
        control={
          <Checkbox
            checked={disabledVertical}
            onChange={(v) => {
              setDisabledVertical(v.currentTarget.checked)
            }}
          ></Checkbox>
        }
      ></FormControlLabel>
    </SettingLine>
  )
}

export const GlobalSettings = () => {
  return (
    <>
      <AutoSectionCheckBox></AutoSectionCheckBox>
      <TimerInput></TimerInput>
      <PersonReplaceUI></PersonReplaceUI>
      <DiabledVerticalCheckbox></DiabledVerticalCheckbox>
      <PlaySpeed></PlaySpeed>
      <ColorSchemeSelect></ColorSchemeSelect>
      <ParagraphRepeatInput></ParagraphRepeatInput>
      <PageListCheckBox></PageListCheckBox>
      <FontSizeInput></FontSizeInput>
    </>
  )
}
