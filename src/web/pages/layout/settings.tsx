import { ArrowRight, Help } from '@mui/icons-material'
import type { SxProps, Theme } from '@mui/material'
import {
  Box,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  Popover,
  Radio,
  RadioGroup,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { t } from 'i18next'
import { useState } from 'react'
import { ZH_PERSON_RULES } from '../../../core/consts.js'
import { isMobile } from '../../../core/util/browser.js'
import {
  useAutoSection,
  useStopTimer,
  useStopTimerSeconds,
  usePersonReplace,
  useSpeechSpeed,
  useUserColorScheme,
  type UserColorscheme,
  USER_COLOR_SCHEMES,
  useParagraphRepeat,
  useSplitPage,
  type SplitPageType,
  SPLIT_PAGE_TYPES,
} from '../../store.js'

export function SettingLine(props: { children: React.ReactNode }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        alignItems: 'center',
      }}
    >
      {props.children}
    </Stack>
  )
}

export function SettingLabel(props: {
  sx?: SxProps<Theme>
  children: React.ReactNode
}) {
  return (
    <Typography sx={{ alignSelf: 'start', ...props.sx }}>
      {props.children}
    </Typography>
  )
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
      <Box>
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
      </Box>
    </SettingLine>
  )
}

function PersonReplaceCheckBox(props: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  const { checked, onChange } = props
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
      <Stack>
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
      </Stack>
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

function SplitPageCheckBox() {
  const [splitPage, setSplitPage] = useSplitPage()
  return (
    <SettingLine>
      <SettingLabel sx={{ paddingTop: 1 }}>
        {t('setting.splitPage')}
      </SettingLabel>
      <RadioGroup
        defaultValue={splitPage}
        onChange={(e) => {
          setSplitPage(e.target.value as SplitPageType)
        }}
      >
        {SPLIT_PAGE_TYPES.map((value) => {
          return (
            <FormControlLabel
              key={value}
              label={t(`setting.splitPageType.${value}`)}
              value={value}
              control={<Radio></Radio>}
            ></FormControlLabel>
          )
        })}
      </RadioGroup>
    </SettingLine>
  )
}

export const GlobalSettings = () => {
  return (
    <>
      <AutoSectionCheckBox></AutoSectionCheckBox>
      <TimerInput></TimerInput>
      <PersonReplaceUI></PersonReplaceUI>
      <PlaySpeed></PlaySpeed>
      <ColorSchemeSelect></ColorSchemeSelect>
      <ParagraphRepeatInput></ParagraphRepeatInput>
      <SplitPageCheckBox></SplitPageCheckBox>
    </>
  )
}
